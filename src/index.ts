import { Plugin, ResolvedConfig } from 'vite';
import runPHP, { PHP_CLI_Args } from './utils/runPHP';
import { existsSync, rmSync } from 'fs';
import { escapePHP, unescapePHP } from './utils/escapePHP';
import { resolve } from 'path';
import writeFile from './utils/writeFile';

type UsePHPConfig = {
	binary?: string;
	entry?: string | string[];
	args?: PHP_CLI_Args;
	tempDir?: string;
};

function usePHP(cfg: UsePHPConfig = {}): Plugin[] {
	const {
		binary = 'php',
		entry = 'index.php',
		args,
		tempDir = '.php-tmp',
	}: UsePHPConfig = cfg;

	runPHP.binary = binary;

	let config: undefined | ResolvedConfig = undefined;

	const entries = Array.isArray(entry) ? entry : [entry];

	function escapeFile(file: string) {
		const tempFile = `${tempDir}/${file}.html`;

		escapePHP(file, tempFile);

		return tempFile;
	}

	function cleanUp(dir = '') {
		const parentDir = dir ? dir + '/' : dir;

		rmSync(parentDir + tempDir, { recursive: true, force: true });
	}

	return [
		{
			name: 'prepare-php',
			config: {
				order: 'post',
				handler(config, env) {
					const gitIgnoreFile = `${tempDir}/.gitignore`;
					if (!existsSync(gitIgnoreFile)) {
						writeFile(gitIgnoreFile, '*\n**/*.php.html');
					}

					const inputs = entries.map(escapeFile);

					return {
						build: {
							rollupOptions: { input: inputs },
						},
						optimizeDeps: { entries: inputs },
					};
				},
			},
			configResolved(_config) {
				config = _config;
			},
		},
		{
			name: 'serve-php',
			apply: 'serve',
			enforce: 'pre',
			configureServer(server) {
				server.middlewares.use(async (req, res, next) => {
					if (req.url) {
						let requestUrl = req.url;
						if (requestUrl.endsWith('/')) {
							requestUrl += 'index.php';
						}
						requestUrl = requestUrl.substring(1);

						const entry = entries.find((file) => {
							return (
								file === requestUrl ||
								file.substring(0, file.lastIndexOf('.')) ===
									requestUrl
							);
						});

						if (entry) {
							let tempFile = `${tempDir}/`;
							tempFile += entry + '.html';

							if (existsSync(resolve(tempFile))) {
								const code = unescapePHP(tempFile);

								const out = await server.transformIndexHtml(
									requestUrl || '/',
									runPHP(code, args),
								);

								res.end(out);
								return;
							}
						}
					}

					next();
				});
			},
			handleHotUpdate({ server, file }) {
				const entry = entries.find(
					(entryFile) =>
						file.endsWith(entryFile) && resolve(entryFile) === file,
				);

				if (entry) {
					escapeFile(entry);

					server.ws.send({
						type: 'full-reload',
						path: '*',
					});
				}
			},
			buildEnd(error) {
				cleanUp();
			},
		},
		{
			name: 'build-php',
			apply: 'build',
			resolveId(source, importer, options) {
				if (
					importer?.endsWith('.html') &&
					importer.includes(`/${tempDir}/`)
				) {
					return { id: resolve(source) };
				}
			},
			closeBundle() {
				const distDir = config?.build.outDir;

				entries.forEach((file) => {
					const code = unescapePHP(`${tempDir}/${file}.html`);

					writeFile(`${distDir}/${file}`, code);
				});

				cleanUp(distDir);
			},
		},
	];
}

export default usePHP;
