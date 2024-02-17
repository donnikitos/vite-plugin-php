import { Plugin, ResolvedConfig, ViteDevServer } from 'vite';
import { existsSync, rmSync } from 'fs';
import { escapePHP, unescapePHP } from './utils/escapePHP';
import { resolve } from 'path';
import writeFile from './utils/writeFile';
import http from 'http';
import phpServer from './utils/phpServer';
import { globSync } from 'fast-glob';

type UsePHPConfig = {
	binary?: string;
	entry?: string | string[];
	tempDir?: string;
	cleanup?: {
		dev?: boolean;
		build?: boolean;
	};
};

function usePHP(cfg: UsePHPConfig = {}): Plugin[] {
	const {
		binary = 'php',
		entry = 'index.php',
		tempDir = '.php-tmp',
		cleanup = {},
	}: UsePHPConfig = cfg;
	const { dev: devCleanup = true } = cleanup;

	phpServer.binary = binary;

	let config: undefined | ResolvedConfig = undefined;
	let viteServer: undefined | ViteDevServer = undefined;

	let entries = Array.isArray(entry) ? entry : [entry];

	function escapeFile(file: string) {
		const tempFile = `${tempDir}/${file}.html`;

		escapePHP(file, tempFile);

		return tempFile;
	}

	function cleanupTemp(dir = '') {
		const parentDir = dir ? dir + '/' : dir;

		rmSync(parentDir + tempDir, { recursive: true, force: true });
	}

	function onExit() {
		if (config?.command === 'serve') {
			phpServer.stop();

			devCleanup && cleanupTemp();
		}

		process.exit();
	}

	[
		'exit',
		'SIGINT',
		'SIGUSR1',
		'SIGUSR2',
		'uncaughtException',
		'SIGTERM',
	].forEach((eventType) => {
		process.on(eventType, onExit.bind(null));
	});

	return [
		{
			name: 'prepare-php',
			enforce: 'post',
			config(config, env) {
				const gitIgnoreFile = `${tempDir}/.gitignore`;
				if (!existsSync(gitIgnoreFile)) {
					writeFile(gitIgnoreFile, '*\n**/*.php.html');
				}

				entries = entries.flatMap((entry) =>
					globSync(entry, {
						dot: true,
						onlyFiles: true,
						unique: true,
						ignore: [tempDir, config.build?.outDir || 'dist'],
					}),
				);

				const inputs = entries.map(escapeFile);

				return {
					build: {
						rollupOptions: { input: inputs },
					},
					optimizeDeps: { entries: inputs },
				};
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
				viteServer = server;

				phpServer.start(viteServer?.config.root);

				server.middlewares.use(async (req, res, next) => {
					try {
						if (req.url) {
							const url = new URL(
								req.url,
								'http://localhost:' + phpServer.port,
							);

							let requestUrl = url.pathname;
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
								const tempFile = `${tempDir}/${entry}.html`;

								if (existsSync(resolve(tempFile))) {
									url.pathname = tempFile;

									const phpResult = await new Promise<string>(
										(resolve, reject) => {
											http.request(
												url.toString(),
												{
													method: req.method,
													headers: req.headers,
												},
												(msg) => {
													msg.on('data', resolve);
												},
											)
												.on('error', reject)
												.end();
										},
									);

									let out = phpResult.toString();
									out = await server.transformIndexHtml(
										requestUrl || '/',
										out,
									);

									res.end(out);
									return;
								}
							}
						}
					} catch (error) {
						console.error(`Error: ${error}`);
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
					const code = unescapePHP(
						`${distDir}/${tempDir}/${file}.html`,
						`${tempDir}/${file}.html.json`,
					);

					writeFile(`${distDir}/${file}`, code);
				});

				cleanupTemp(distDir);
			},
		},
	];
}

export default usePHP;
