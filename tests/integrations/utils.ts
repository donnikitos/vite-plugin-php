import { rmSync } from 'node:fs';

let buildPromise: Promise<void> | undefined;

export function ensurePluginBuilt() {
	if (!buildPromise) {
		buildPromise = new Promise<void>((resolve, reject) => {
			Bun.spawn(['bun', 'run', 'build'], {
				onExit(subprocess, exitCode, signalCode, error) {
					if (error) {
						reject(error);
					} else {
						resolve();
					}
				},
			});
		});
	}

	return buildPromise;
}

export function runBuild(cwd?: string) {
	return new Promise<void>((resolve, reject) => {
		Bun.spawn(['bun', 'vite', 'build'], {
			cwd,
			onExit(subprocess, exitCode, signalCode, error) {
				if (error) {
					reject(error);
				} else {
					resolve();
				}
			},
		});
	});
}
export function cleanUp(cwd: string) {
	rmSync(cwd, { recursive: true, force: true });
}
