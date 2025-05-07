import type { Plugin, ViteDevServer } from 'vite';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { shared } from '../shared';
import PHP_Server from '../utils/PHP_Server';
import { tempName, writeFile } from '../utils/file';
import PHP_Code from '../utils/PHP_Code';
import handleExit from '../utils/handleExit';
import phpProxy from '../utils/PHP_Server/proxy';
import { fixAssetsInjection } from '../utils/fixAssetsInjection';

export const serve = {
	rewriteUrl: (url: URL) => url as URL | undefined,
};

let devServer: undefined | ViteDevServer = undefined;

const codeMap = new Map<string, Record<string, string>>();

const servePlugin: Plugin[] = [
	{
		name: 'serve-php:pre',
		apply: 'serve',
		enforce: 'pre',
		configResolved(config) {
			handleExit.register();

			const gitIgnoreFile = resolve(`${shared.tempDir}/.gitignore`);
			if (!existsSync(gitIgnoreFile)) {
				writeFile(gitIgnoreFile, '*\r\n**/*');
			}
		},
		async configureServer(server) {
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
		// `rollupOptions.input` entries not arriving in `resolveId(source, importer, options)` -> force file loading with buildStart
		async buildStart(options) {
			await Promise.allSettled(
				shared.entries.map(async (entry) => {
					await this.load({
						id: entry,
					});
				}),
			);
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
		transform: {
			async handler(code, id, options) {
				if (shared.entries.includes(id) && devServer) {
					return {
						code: await devServer.transformIndexHtml(
							// Rename ids because Vite transforms only .html files: https://github.com/vitejs/vite/blob/0cde495ebeb48bcfb5961784a30bfaed997790a0/packages/vite/src/node/plugins/html.ts#L330
							`/${id}.html`,
							code,
						),
					};
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
		async watchChange(id, change) {
			const entry = shared.entries.find(
				(entryFile) => resolve(entryFile) === resolve(id),
			);

			if (entry) {
				// Fail silently - `vite:import-analysis` plugin doesn't like the second load
				try {
					await this.load({
						id: entry,
					});
				} catch (error) {
					// console.log('error', error);
				}
			}
		},
		handleHotUpdate({ server, file }) {
			const entry = shared.entries.find(
				(entryFile) => resolve(entryFile) === resolve(file),
			);

			if (
				entry ||
				(!file.startsWith(resolve(shared.tempDir)) &&
					file.includes('.php'))
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
	{
		name: 'serve-php:unescape',
		apply: 'serve',
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

					php.write(tempName(entry));

					return php.code;
				}
			},
		},
	},
];

export default servePlugin;
