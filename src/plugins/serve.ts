import { Plugin } from 'vite';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import http, { IncomingHttpHeaders, IncomingMessage } from 'node:http';
import { shared, internalParam } from '../shared';
import PHP_Server from '../utils/PHP_Server';
import { writeFile } from '../utils/file';
import PHP_Code from '../utils/PHP_Code';
import handleExit from '../utils/handleExit';

export const serve = {
	rewriteUrl: (url: URL) => url as URL | undefined,
};

function tempName(entry: string) {
	return `${shared.tempDir}/${entry}`;
}

const servePlugin: Plugin = {
	name: 'serve-php',
	apply: 'serve',
	enforce: 'post',
	configResolved() {
		handleExit.register();

		const gitIgnoreFile = resolve(`${shared.tempDir}/.gitignore`);
		if (!existsSync(gitIgnoreFile)) {
			writeFile(gitIgnoreFile, '*\r\n**/*');
		}

		shared.entries.forEach((entry) => {
			PHP_Code.fromFile(entry).applyEnv().write(tempName(entry));
		});
	},
	async configureServer(server) {
		server.restart = ((originalRestart) => {
			return async function (...args) {
				handleExit.unregister();

				return originalRestart.apply(null, args);
			};
		})(server.restart);

		if (!PHP_Server.process) {
			await PHP_Server.start(server?.config.root);
		}

		server.middlewares.use(async (req, res, next) => {
			try {
				if (
					req.url &&
					!['/@vite', '/@fs', '/@id/__x00__', '/node_modules'].some(
						(path) => req.url!.startsWith(path),
					)
				) {
					req.on('error', (error) => {
						throw error;
					});

					const url = new URL(req.url, 'http://localhost');
					if (shared.viteConfig?.server.port) {
						url.port = shared.viteConfig.server.port.toString();
					}
					const requestUrl = url.pathname;

					if (url.pathname.endsWith('/')) {
						url.pathname += 'index.php';
					}

					const routedUrl = serve.rewriteUrl(url);
					if (routedUrl) {
						url.pathname = routedUrl.pathname;
						url.search = routedUrl.search;
						url.hash = routedUrl.hash;
					}

					const entryPathname = url.pathname.substring(1);

					const entry = shared.entries.find((file) => {
						return (
							file === entryPathname ||
							file.substring(0, file.lastIndexOf('.')) ===
								entryPathname
						);
					});

					if (entry) {
						const tempFile = tempName(entry);

						if (existsSync(resolve(tempFile))) {
							url.pathname = tempFile;
							url.host = PHP_Server.host;
							url.port = PHP_Server.port.toString();

							url.searchParams.set(
								internalParam,
								new URLSearchParams({
									$REQUEST_URI: requestUrl,
									$PHP_SELF: '/' + entry,
									temp_dir: shared.tempDir,
									error_levels:
										shared.devConfig.errorLevels.toString(),
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
								const chunks: any[] = [];
								let statusCode: IncomingMessage['statusCode'];
								let incomingHeaders: IncomingHttpHeaders = {};

								const request = http
									.request(
										url.toString(),
										{
											method: req.method,
											headers: {
												...req.headers,
												'content-length':
													Buffer.byteLength(body),
											},
										},
										(msg) => {
											statusCode = msg.statusCode;
											incomingHeaders = msg.headers;

											msg.on('data', (data) => {
												chunks.push(data);
											});
										},
									)
									.on('error', (error) => {
										reject(error);
									})
									.on('close', () => {
										const content =
											Buffer.concat(chunks).toString(
												'utf8',
											);

										resolve({
											statusCode,
											headers: incomingHeaders,
											content,
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
								phpResult.headers['content-type']?.includes(
									'html',
								)
							) {
								out = await server.transformIndexHtml(
									`/${entry}.html:${requestUrl}`,
									out,
									requestUrl,
								);
							}

							res.writeHead(
								phpResult.statusCode || 200,
								phpResult.headers,
							).end(out);

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
	handleHotUpdate({ server, file }) {
		const entry = shared.entries.find(
			(entryFile) => resolve(entryFile) === resolve(file),
		);

		if (entry) {
			PHP_Code.fromFile(entry).applyEnv().write(tempName(entry));

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
