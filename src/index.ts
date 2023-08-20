import { Plugin } from 'vite';
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

	const entries = Array.isArray(entry) ? entry : [entry];

	const gitIgnoreFile = `${tempDir}/.gitignore`;
	if (!existsSync(gitIgnoreFile)) {
		writeFile(gitIgnoreFile, '*\n**/*.php.html');
	}

	function escapeFile(file: string) {
		const tempFile = `${tempDir}/${file}.html`;

		escapePHP(file, tempFile);

		return tempFile;
	}

	return [
		{
			name: 'prepare-php',
			config: {
				order: 'post',
				handler(config, env) {
					const inputs = entries.map(escapeFile);

					return {
						build: {
							rollupOptions: { input: inputs },
						},
						optimizeDeps: { entries: inputs },
					};
				},
			},
		},
		{
			name: 'serve-php',
			apply: 'serve',
			enforce: 'pre',
			configureServer(server) {
				server.middlewares.use(async (req, res, next) => {
					const requestUrl =
						req.url === '/' || req.url === '/index.html'
							? '/index.html'
							: req.url;

					let tempFile = `${tempDir}/`;

					if (requestUrl?.endsWith('.php')) {
						tempFile += requestUrl + '.html';
					} else if (requestUrl?.endsWith('.html')) {
						tempFile += requestUrl?.replace('.html', '.php.html');
					} else {
						tempFile += requestUrl + '.php.html';
					}

					if (existsSync(resolve(tempFile))) {
						const code = unescapePHP(tempFile);

						const out = await server.transformIndexHtml(
							requestUrl || '/',
							runPHP(code, args),
						);

						res.end(out);
						return;
					}

					next();
				});
			},
			handleHotUpdate({ server, file }) {
				if (file.endsWith('.php')) {
					const entry = entries.find(
						(entryFile) =>
							server.config.root + '/' + entryFile === file,
					);

					if (entry) {
						escapeFile(entry);

						server.ws.send({
							type: 'full-reload',
							path: '*',
						});
					}
				}
			},
		},
		{
			name: 'build-php',
			apply: 'build',
			resolveId(source, importer, options) {
				console.log('source', source);
				if (
					importer?.endsWith('.php.html') &&
					importer.includes(`/${tempDir}/`)
				) {
					return { id: resolve(source) };
				}
			},
			closeBundle() {
				entries.forEach((file) => {
					const code = unescapePHP(`${tempDir}/${file}.html`);

					writeFile(`dist/${file}`, code);
				});

				rmSync(`dist/${tempDir}`, { recursive: true, force: true });
			},
		},
	];
}

export default usePHP;
