import { Plugin, ResolvedConfig, ViteDevServer } from 'vite';
import { existsSync, rmSync } from 'fs';
import { escapePHP, unescapePHP } from './utils/escapePHP';
import { resolve } from 'path';
import writeFile from './utils/writeFile';
import http, { IncomingHttpHeaders, IncomingMessage } from 'http';
import phpServer from './utils/phpServer';
import fastGlob from 'fast-glob';
import consoleHijack from './utils/consoleHijack';

const internalParam = '__314159265359__';

type UsePHPConfig = {
	binary?: string;
	entry?: string | string[];
	rewriteUrl?: (requestUrl: URL) => URL | undefined;
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
		rewriteUrl = (requestUrl) => requestUrl,
		tempDir = '.php-tmp',
		cleanup = {},
	}: UsePHPConfig = cfg;
	const { dev: devCleanup = true } = cleanup;

	phpServer.binary = binary;

	let config: undefined | ResolvedConfig = undefined;
	let viteServer: undefined | ViteDevServer = undefined;

	let entries = Array.isArray(entry) ? entry : [entry];

	function getTempFileName(file: string) {
		return `${tempDir}/${file}.html`;
	}

	function cleanupTemp() {
		rmSync(tempDir, { recursive: true, force: true });
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

				entries = [
					...new Set(
						entries.flatMap((entry) =>
							fastGlob.globSync(entry, {
								dot: true,
								onlyFiles: true,
								unique: true,
								ignore: [
									tempDir,
									config.build?.outDir || 'dist',
								],
							}),
						),
					),
				];

				consoleHijack(entries);

				return {
					build: {
						rollupOptions: { input: entries },
					},
					optimizeDeps: { entries },
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
			configResolved(_config) {
				config = _config;

				entries.forEach((entry) => {
					const outputFile = getTempFileName(entry);

					escapePHP({
						inputFile: entry,
						config: config as ResolvedConfig,
					}).write(outputFile);
				});
			},
			configureServer(server) {
				viteServer = server;

				phpServer.start(viteServer?.config.root);

				server.middlewares.use(async (req, res, next) => {
					try {
						if (
							req.url &&
							!['/@vite', '/@fs', '/@id/__x00__'].some((path) =>
								req.url!.startsWith(path),
							)
						) {
							req.on('error', (error) => {
								throw error;
							});
							res.on('error', (error) => {
								throw error;
							});

							const url = new URL(req.url, 'http://localhost');
							if (config?.server.port) {
								url.port = config.server.port.toString();
							}
							const requestUrl = url.pathname;

							if (url.pathname.endsWith('/')) {
								url.pathname += 'index.php';
							}

							const routedUrl = rewriteUrl(url);
							if (routedUrl) {
								url.pathname = routedUrl.pathname;
								url.search = routedUrl.search;
								url.hash = routedUrl.hash;
							}

							const entryPathname = url.pathname.substring(1);

							const entry = entries.find((file) => {
								return (
									file === entryPathname ||
									file.substring(0, file.lastIndexOf('.')) ===
										entryPathname
								);
							});

							if (entry) {
								const tempFile = getTempFileName(entry);

								if (existsSync(resolve(tempFile))) {
									url.pathname = tempFile;
									url.port = phpServer.port.toString();

									url.searchParams.set(
										internalParam,
										new URLSearchParams({
											REQUEST_URI: requestUrl,
											PHP_SELF: '/' + entry,
										}).toString(),
									);

									const body = await new Promise<Buffer>(
										(resolve, reject) => {
											let data: any[] = [];
											req.on('data', (chunk) => {
												data.push(chunk);
											}).on('end', () => {
												resolve(Buffer.concat(data));
											});
										},
									);

									const phpResult = await new Promise<{
										statusCode: number | undefined;
										headers: http.IncomingHttpHeaders;
										content: string;
									}>(async (resolve, reject) => {
										const headers = req.headers;
										delete headers['content-length'];
										const chunks: any[] = [];
										let statusCode: IncomingMessage['statusCode'];
										let incomingHeaders: IncomingHttpHeaders =
											{};

										const request = http
											.request(
												url.toString(),
												{
													method: req.method,
													headers,
												},
												(msg) => {
													statusCode = msg.statusCode;
													incomingHeaders =
														msg.headers;

													msg.on('data', (data) =>
														chunks.push(data),
													);
												},
											)
											.on('error', (error) => {
												reject(error);
											})
											.on('close', () => {
												resolve({
													statusCode,
													headers: incomingHeaders,
													content:
														Buffer.concat(
															chunks,
														).toString('utf8'),
												});
											});

										request.write(body, (error) => {
											if (error) {
												reject(error);
											}
										});

										request.end();
									});

									let out = phpResult.content;

									if (
										phpResult.headers[
											'content-type'
										]?.includes('html')
									) {
										out = await server.transformIndexHtml(
											requestUrl,
											out,
											'/' + entryPathname,
										);
									}

									res.writeHead(phpResult.statusCode || 200, {
										...req.headers,
										...phpResult.headers,
									}).end(out);

									return;
								}
							}
						}
					} catch (error) {
						console.error('Vite-PHP Error: ' + error);
					}

					next();
				});
			},
			async handleHotUpdate({ server, file }) {
				const entry = entries.find(
					(entryFile) => resolve(entryFile) === file,
				);

				if (entry) {
					const outputFile = getTempFileName(entry);

					escapePHP({
						inputFile: entry,
						config: config as ResolvedConfig,
					}).write(outputFile);

					server.moduleGraph.invalidateAll();
				}

				if (
					entry ||
					(!file.startsWith(resolve(tempDir)) &&
						file.includes('.php'))
				) {
					server.ws.send({
						type: 'full-reload',
					});
				}
			},
		},
		{
			name: 'build-php',
			apply: 'build',
			enforce: 'pre',
			resolveId(source, importer, options) {
				if (entries.includes(source)) {
					return {
						// Rename ids because Vite transforms only .html files: https://github.com/vitejs/vite/blob/0cde495ebeb48bcfb5961784a30bfaed997790a0/packages/vite/src/node/plugins/html.ts#L330
						id: `${source}.html`,
						resolvedBy: 'vite-plugin-php',
						meta: {
							originalId: source,
						},
					};
				}
			},
			load(id, options) {
				const entry = this.getModuleInfo(id)?.meta.originalId;

				if (entry) {
					const { escapedCode, phpCodes } = escapePHP({
						inputFile: entry,
						config: config!,
					});

					return {
						code: escapedCode,
						meta: { phpCodes },
					};
				}
			},
			generateBundle: {
				order: 'post',
				handler(options, bundle, isWrite) {
					Object.entries(bundle).forEach(([key, item]) => {
						if (item.type === 'asset') {
							const meta = this.getModuleInfo(
								item.fileName,
							)?.meta;

							if (meta?.originalId && meta?.phpCodes) {
								item.fileName = meta.originalId;

								item.source = unescapePHP({
									escapedCode: item.source.toString(),
									phpCodes: meta.phpCodes,
								});
							}
						} else if (
							item.type === 'chunk' &&
							item.facadeModuleId
						) {
							const meta = this.getModuleInfo(
								item.facadeModuleId,
							)?.meta;

							if (meta?.phpCodes) {
								item.code = unescapePHP({
									escapedCode: item.code,
									phpCodes: meta.phpCodes,
								});
							}
						}
					});
				},
			},
		},
	];
}

export default usePHP;
