import { relative } from 'node:path';
import { normalizePath, UserConfig } from 'vite';
import colors from 'picocolors';
import { shared } from '../shared';
import { hasViteConfig } from './assert';

// Taken from original Vite code: https://github.com/vitejs/vite/blob/2f7bf79bfc668fc260fb93fa705ce32ac7d1d665/packages/vite/src/node/env.ts#L75

function resolveEnvPrefix({ envPrefix = 'VITE_' }: UserConfig) {
	envPrefix = Array.isArray(envPrefix) ? envPrefix : [envPrefix];

	if (envPrefix.includes('')) {
		throw new Error(
			`envPrefix option contains value '', which could lead unexpected exposure of sensitive information.`,
		);
	}

	return envPrefix;
}

// Taken from original Vite code: https://github.com/vitejs/vite/blob/2f7bf79bfc668fc260fb93fa705ce32ac7d1d665/packages/vite/src/node/plugins/html.ts#L1122

const envPattern = /%(\S+?)%/g;

function initReplaceEnv() {
	hasViteConfig(shared.viteConfig);

	const { env, define, root, logger } = shared.viteConfig;
	const envPrefix = resolveEnvPrefix({
		envPrefix: shared.viteConfig.envPrefix,
	});

	// account for user env defines
	for (const key in define) {
		if (key.startsWith(`import.meta.env.`)) {
			const val = define[key];
			if (typeof val === 'string') {
				try {
					const parsed = JSON.parse(val);
					env[key.slice(16)] =
						typeof parsed === 'string' ? parsed : val;
				} catch {
					env[key.slice(16)] = val;
				}
			} else {
				env[key.slice(16)] = JSON.stringify(val);
			}
		}
	}

	return function replaceEnv(content: string, filename: string) {
		const relativeHtml = normalizePath(relative(root, filename));

		return content.replace(envPattern, (text, key) => {
			if (key in env) {
				return env[key];
			} else {
				if (envPrefix.some((prefix) => key.startsWith(prefix))) {
					logger.warn(
						colors.yellow(
							colors.bold(
								`(!) ${text} is not defined in env variables found in /${relativeHtml}. ` +
									`Is the variable mistyped?`,
							),
						),
					);
				}

				return text;
			}
		});
	};
}

export default initReplaceEnv;
