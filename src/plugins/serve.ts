import { Plugin, ViteDevServer } from 'vite';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { shared } from '../shared';
import PHP_Server from '../utils/PHP_Server';
import { tempName, writeFile } from '../utils/file';
import PHP_Code from '../utils/PHP_Code';
import handleExit from '../utils/handleExit';
import phpProxy from '../utils/PHP_Server/proxy';

export const serve = {
	rewriteUrl: (url: URL) => url as URL | undefined,
};

let devServer: undefined | ViteDevServer = undefined;

const entryMap = new Map<string, string>();

const servePlugin: Plugin = {
	name: 'serve-php',
	apply: 'serve',
	enforce: 'post',
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
				// Process as virtual modules
				const id = `\0${entry}`;

				entryMap.set(id, entry);

				await this.load({
					id,
				});
			}),
		);
	},
	load(id) {
		const entry = entryMap.get(id);

		if (entry) {
			const php = PHP_Code.fromFile(entry);

			return {
				code: `export default ${JSON.stringify(php.code)}`,
			};
		}
	},
	async transform(code, id, options) {
		const entry = entryMap.get(id);

		if (entry) {
			const php = new PHP_Code(
				JSON.parse(code.substring('export default '.length)),
			);
			php.applyEnv();

			if (devServer) {
				php.escape();
				php.code = await devServer.transformIndexHtml(
					`/${entry}.html`,
					php.code,
				);
				php.code = PHP_Code.unescape(php.code, php.mapping);
			}

			php.write(tempName(entry));

			return {
				code: `export default ${JSON.stringify(php.code)}`,
			};
		}
	},
	async watchChange(id, change) {
		const entry = shared.entries.find(
			(entryFile) => resolve(entryFile) === resolve(id),
		);

		if (entry) {
			await this.load({
				id: `\0${entry}`,
			});
		}
	},
	handleHotUpdate({ server, file }) {
		const entry = shared.entries.find(
			(entryFile) => resolve(entryFile) === resolve(file),
		);

		if (entry) {
			server.moduleGraph.invalidateAll();
		}

		if (
			entry ||
			(!file.startsWith(resolve(shared.tempDir)) && file.includes('.php'))
		) {
			server.ws.send({
				type: 'full-reload',
			});
		}
	},
};

export default servePlugin;
