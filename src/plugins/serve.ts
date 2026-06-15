import type { Logger, Plugin, ViteDevServer } from 'vite';
import { resolve } from 'node:path';
import { existsSync, rmSync } from 'node:fs';
import { shared } from '../shared';
import PHP_Server from '../utils/PHP_Server';
import { tempName, writeFile } from '../utils/file';
import PHP_Code from '../utils/PHP_Code';
import handleExit from '../utils/handleExit';
import phpProxy from '../utils/PHP_Server/proxy';
import {
	fixAssetsInjection,
	viteClientInjectionPattern,
} from '../utils/fixAssetsInjection';
import findFiles from '../utils/findFiles';
import escapeRegExp from '../utils/escapeRegExp';

export const serve = {
	rewriteUrl: (url: URL) => url as URL | undefined,
};

let devServer: undefined | ViteDevServer = undefined;

let entryMatcher: RegExp = new RegExp(``, 'gs');
function updateEntryMatcher() {
	entryMatcher = new RegExp(
		`(${shared.entries.map(escapeRegExp).join('|')}).html`,
		'gs',
	);
}

const codeMap = new Map<string, Record<string, string>>();

const servePlugin: Plugin[] = [
	{
		name: 'php:serve-load',
		apply: 'serve',
		configResolved: {
			handler(config) {
				handleExit.register();

				const gitIgnoreFile = resolve(`${shared.tempDir}/.gitignore`);
				if (!existsSync(gitIgnoreFile)) {
					writeFile(gitIgnoreFile, '*\r\n**/*');
				}

				updateEntryMatcher();
			},
		},
		configureServer: {
			async handler(server) {
				devServer = server;

				server.restart = ((originalRestart) => {
					return async function (...args) {
						handleExit.unregister();

						return originalRestart.apply(null, args);
					};
				})(server.restart);

				if (!PHP_Server.process) {
					await PHP_Server.start(server.config.root);
				}

				server.middlewares.use(phpProxy);
			},
		},
		// `rollupOptions.input` entries not arriving in `resolveId(source, importer, options)` -> force file loading with buildStart
		buildStart: {
			async handler(options) {
				await Promise.allSettled(
					shared.entries.map(async (entry) => {
						await this.load({
							id: entry,
						});
					}),
				);
			},
		},
		load: {
			handler(id, options) {
				if (shared.entries.includes(id)) {
					const php = PHP_Code.fromFile(id);

					return {
						code: php.code,
					};
				}
			},
		},
	},
	{
		name: 'php:serve-escape',
		apply: 'serve',
		transform: {
			async handler(code, id, options) {
				if (shared.entries.includes(id) && devServer) {
					let ogWarnLogger: Logger['warn'] = () => {};

					if (shared.viteConfig) {
						const warnings = new Set();

						ogWarnLogger = shared.viteConfig.logger.warn;

						shared.viteConfig.logger.warn = ((fn) =>
							function (...args) {
								const ser = args
									.toString()
									.replace(entryMatcher, (match, p1) => p1);

								if (warnings.has(ser)) {
									return;
								}

								warnings.add(ser);

								return fn.apply(null, args);
							})(shared.viteConfig.logger.warn);
					}

					const res = {
						code: await devServer.transformIndexHtml(
							// Rename ids because Vite transforms only .html files: https://github.com/vitejs/vite/blob/0cde495ebeb48bcfb5961784a30bfaed997790a0/packages/vite/src/node/plugins/html.ts#L330
							`/${id}.html`,
							code,
						),
					};

					if (shared.viteConfig) {
						shared.viteConfig.logger.warn = ogWarnLogger;
					}

					return res;
				}
			},
		},
		transformIndexHtml: {
			order: 'pre',
			handler(html, ctx) {
				const entry = ctx.path.substring(
					1,
					ctx.path.length - '.html'.length,
				);

				if (shared.entries.includes(entry)) {
					const php = new PHP_Code(html);
					php.file = entry;
					php.applyEnv();
					php.escape();
					codeMap.set(entry, php.mapping);

					return php.code;
				}
			},
		},
	},
	{
		name: 'php:serve-unescape',
		apply: 'serve',
		enforce: 'post',
		transform: {
			order: 'post',
			handler(code, id, options) {
				let entry = '';

				if (
					id.includes('html-proxy') &&
					shared.entries.some((entryItem) => {
						const res = id.startsWith(`\0/${entryItem}.html?`);

						if (res) {
							entry = entryItem;

							return true;
						}
					})
				) {
					const escapes = codeMap.get(entry);

					if (escapes) {
						return {
							code: PHP_Code.unescape(code, escapes),
						};
					}
				}
			},
		},
		transformIndexHtml: {
			order: 'post',
			handler(html, ctx) {
				const entry = ctx.path.substring(
					1,
					ctx.path.length - '.html'.length,
				);

				if (shared.entries.includes(entry)) {
					const escapes = codeMap.get(entry);

					let php = new PHP_Code(html);
					php.file = entry;

					if (escapes) {
						php.code = PHP_Code.unescape(php.code, escapes);
					}
					php.code = fixAssetsInjection(php.code);
					php.code = php.code.replace(
						new RegExp(viteClientInjectionPattern, 'gsi'),
						'',
					);

					php.write(tempName(entry));

					return php.code;
				}
			},
		},
	},
	{
		name: 'php:serve-watch',
		apply: 'serve',
		async watchChange(id, change) {
			const resolvedId = resolve(id);
			const root = devServer?.config.root || process.cwd();
			const entry = shared.entries.find(
				(entryFile) => resolve(root, entryFile) === resolvedId,
			);

			if (change.event === 'delete' && entry) {
				// Fail silently - in case there already was a cleanup
				try {
					rmSync(resolve(shared.tempDir, entry));
				} catch (error) {
					// console.log('error', error);
				}
			} else {
				const loadEntry = async (entry: string) => {
					// Fail silently - `vite:import-analysis` plugin doesn't like the second load
					try {
						await this.load({
							id: entry,
						});
					} catch (error) {
						// console.log('error', error);
					}
				};

				if (entry) {
					await loadEntry(entry);
				} else if (
					devServer &&
					!resolvedId.startsWith(resolve(shared.tempDir)) &&
					resolvedId.includes('.php')
				) {
					const priorEntries = shared.entries;

					shared.entries = findFiles(
						shared.entryPatterns,
						devServer.config.root,
						[
							shared.tempDir,
							devServer.config.build?.outDir || 'dist',
						],
					);
					updateEntryMatcher();

					const allEntries = shared.entries;
					const newEntries = allEntries.filter(
						(entry) => !priorEntries.includes(entry),
					);

					await Promise.allSettled(newEntries.map(loadEntry));
				}
			}
		},
		handleHotUpdate({ server, file }) {
			const resolvedFile = resolve(file);
			const root = devServer?.config.root || process.cwd();
			const entry = shared.entries.find(
				(entryFile) => resolve(root, entryFile) === resolvedFile,
			);

			if (
				entry ||
				(!resolvedFile.startsWith(resolve(shared.tempDir)) &&
					resolvedFile.includes('.php'))
			) {
				server.ws.send({
					type: 'full-reload',
				});
			}

			if (entry) {
				server.moduleGraph.invalidateAll();
			}
		},
	},
];

export default servePlugin;
