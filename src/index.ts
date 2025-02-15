import { Plugin, ResolvedConfig } from 'vite';
import { rmSync } from 'node:fs';
import { resolve } from 'node:path';
import php from './utils/phpServer';
import fastGlob from 'fast-glob';
import consoleHijack from './utils/consoleHijack';
import servePlugin, { serve } from './plugins/serve';
import buildPlugin from './plugins/build';

export const internalParam = '__314159265359__';

export const shared = {
	viteConfig: undefined as undefined | ResolvedConfig,
	entries: [] as string[],
	tempDir: '.php-tmp',
};

type UsePHPConfig = {
	binary?: string;
	entry?: string | string[];
	rewriteUrl?: (requestUrl: URL) => URL | undefined;
	tempDir?: string;
	cleanup?: {
		dev?: boolean;
	};
};

function usePHP(cfg: UsePHPConfig = {}): Plugin[] {
	const { entry = 'index.php' } = cfg;
	const { dev: devCleanup = true } = cfg.cleanup || {};

	php.binary = cfg.binary ?? php.binary;
	serve.rewriteUrl = cfg.rewriteUrl ?? serve.rewriteUrl;
	shared.entries = Array.isArray(entry) ? entry : [entry];
	shared.tempDir = cfg.tempDir ?? shared.tempDir;

	let exited = false;
	function onExit() {
		if (exited) {
			return;
		}
		exited = true;

		if (shared.viteConfig?.command === 'serve') {
			php.stop();

			devCleanup &&
				rmSync(resolve(shared.tempDir), {
					recursive: true,
					force: true,
				});
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

				consoleHijack(shared.entries);

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
