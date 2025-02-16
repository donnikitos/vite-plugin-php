import { Plugin } from 'vite';
import php from './utils/phpServer';
import fastGlob from 'fast-glob';
import consoleHijack from './utils/consoleHijack';
import servePlugin, { serve } from './plugins/serve';
import buildPlugin from './plugins/build';
import { shared } from './shared';

export * from './enums/php-error';

export type UsePHPConfig = {
	binary?: string;
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

	php.binary = cfg.binary ?? php.binary;
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
					build: {
						rollupOptions: { input: shared.entries },
					},
					optimizeDeps: { entries: shared.entries },
				};
			},
			configResolved(_config) {
				shared.viteConfig = _config;
			},
		},
		servePlugin,
		buildPlugin,
	];
}

export default usePHP;
