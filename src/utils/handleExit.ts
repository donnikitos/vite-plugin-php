import { resolve } from 'node:path';
import { existsSync, rmSync } from 'node:fs';
import { shared } from '../shared';
import log from '../utils/log';
import PHP_Server from './PHP_Server';

export const exitSignals = [
	'exit',
	'SIGINT',
	'SIGUSR1',
	'SIGUSR2',
	'uncaughtException',
	'SIGTERM',
];

function exitHandler(signal: any) {
	if (signal === 'SIGINT') {
		console.log();
	}

	const tempDir = resolve(shared.tempDir);
	if (shared.devConfig.cleanup && existsSync(tempDir)) {
		log('Removing temporary files');
		rmSync(tempDir, {
			recursive: true,
			force: true,
		});
	}

	if (PHP_Server.process && shared.viteConfig?.command === 'serve') {
		PHP_Server.stop(() => {
			process.exit();
		});
	} else {
		process.exit();
	}
}

const listeners = new Map();

const handleExit = {
	register() {
		exitSignals.forEach((eventType) => {
			new Promise((resolve) => {
				listeners.set(eventType, resolve);
				process.on(eventType, resolve);
			}).then(exitHandler);
		});
	},
	unregister() {
		exitSignals.forEach((eventType) => {
			const listener = listeners.get(eventType);

			if (listener) {
				process.off(eventType, listener);
				listeners.delete(eventType);
			}
		});
	},
};

export default handleExit;
