import { Plugin } from 'vite';
import PHP_Server from './utils/PHP_Server';
import fastGlob from 'fast-glob';
import consoleHijack from './utils/consoleHijack';
import servePlugin, { serve } from './plugins/serve';
import buildPlugin from './plugins/build';
import { shared } from './shared';

export * from './enums/php-error';

export type UsePHPConfig = {
	binary?: string;
	php?: { host?: string };
	entry?: string | string[];
	rewriteUrl?: (requestUrl: URL) => URL | undefined;
	tempDir?: string;
	dev?: {
		errorLevels?: number; // EPHPError
		cleanup?: boolean;
	};
};

function usePHP(cfg: UsePHPConfig = {}): Plugin[] {
	const { entry = 'index.php' } = cfg;

	PHP_Server.binary = cfg.binary ?? PHP_Server.binary;
	PHP_Server.host = cfg.php?.host ?? PHP_Server.host;
	serve.rewriteUrl = cfg.rewriteUrl ?? serve.rewriteUrl;
	shared.entries = Array.isArray(entry) ? entry : [entry];
	shared.tempDir = cfg.tempDir ?? shared.tempDir;
	shared.devConfig = {
		cleanup: cfg.dev?.cleanup || shared.devConfig.cleanup,
		errorLevels: cfg.dev?.errorLevels || shared.devConfig.errorLevels,
	};

	return [
		{
			name: 'init-php',
			enforce: 'post',
			config(config, env) {
				shared.entries = [
					...new Set(
						shared.entries.flatMap((entry) =>
							fastGlob.globSync(entry, {
								dot: true,
								onlyFiles: true,
								unique: true,
								ignore: [
									shared.tempDir,
									config.build?.outDir || 'dist',
								],
							}),
						),
					),
				];

				consoleHijack();

				return {
					server: {
						watch: {
							ignored: [`**/${shared.tempDir}/**`],
						},
					},
					build: {
						rollupOptions: {
							input: shared.entries,
						},
					},
					optimizeDeps: {
						entries: shared.entries,
					},
				};
			},
			configResolved(_config) {
				shared.viteConfig = _config;
			},
		},
		servePlugin,
		...buildPlugin,
	];
}

export default usePHP;
