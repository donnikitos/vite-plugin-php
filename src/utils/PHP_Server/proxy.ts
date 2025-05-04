import { Connect } from 'vite';
import { internalParam, shared } from '../../shared';
import { serve } from '../../plugins/serve';
import { tempName } from '../file';
import http, { type IncomingHttpHeaders, IncomingMessage } from 'node:http';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import PHP_Server from '.';

const phpProxy: Connect.NextHandleFunction = async (req, res, next) => {
	try {
		if (
			req.url &&
			!['/@vite', '/@fs', '/@id/__x00__', '/node_modules'].some((path) =>
				req.url!.startsWith(path),
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
					file.substring(0, file.lastIndexOf('.')) === entryPathname
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
									Buffer.concat(chunks).toString('utf8');

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

					res.writeHead(
						phpResult.statusCode || 200,
						phpResult.headers,
					).end(phpResult.content);

					return;
				}
			}
		}
	} catch (error) {
		console.error('Vite-PHP Error: ' + error);
	}

	next();
};

export default phpProxy;
