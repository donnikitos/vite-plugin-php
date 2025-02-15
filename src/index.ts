import { Plugin } from 'vite';
import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import php from './utils/phpServer';
import fastGlob from 'fast-glob';
import consoleHijack from './utils/consoleHijack';
import servePlugin, { serve } from './plugins/serve';
import buildPlugin from './plugins/build';
import { shared } from './shared';
import log from './utils/log';

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

	function handleExit(signal: any) {
		if (signal === 'SIGINT') {
			console.log();
		}

		const tempDir = resolve(shared.tempDir);
		if (devCleanup && existsSync(tempDir)) {
			log('Removing temporary files');
			rmSync(tempDir, {
				recursive: true,
				force: true,
			});
		}

		if (php.process && shared.viteConfig?.command === 'serve') {
			php.stop(() => {
				process.exit();
			});
		} else {
			process.exit();
		}
	}

	[
		'exit',
		'SIGINT',
		'SIGUSR1',
		'SIGUSR2',
		'uncaughtException',
		'SIGTERM',
	].forEach((eventType) => {
		new Promise((resolve) => process.on(eventType, resolve)).then(
			handleExit,
		);
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
