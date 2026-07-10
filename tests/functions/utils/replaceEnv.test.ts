import { describe, it, expect, beforeEach } from 'bun:test';
import initReplaceEnv from '../../../src/utils/replaceEnv';
import { shared } from '../../../src/shared';
import { resolveConfig, type UserConfig } from 'vite';

function mockConfig(config: UserConfig) {
	return resolveConfig(config, 'build');
}

describe('replaceEnv', () => {
	beforeEach(async () => {
		shared.viteConfig = await resolveConfig({}, 'build');
	});

	it('replaces %VAR% with env value', async () => {
		shared.viteConfig = await mockConfig({});
		shared.viteConfig.env.VITE_TITLE = 'My Title';

		const replaceEnv = initReplaceEnv();
		expect(
			replaceEnv('<title>%VITE_TITLE%</title>', '/project/index.php'),
		).toBe('<title>My Title</title>');
	});

	it('keeps unknown placeholders untouched', () => {
		const replaceEnv = initReplaceEnv();
		expect(replaceEnv('%UNKNOWN%', '/project/index.php')).toBe('%UNKNOWN%');
	});

	it('warns when prefixed env variable is missing', async () => {
		const warnings: string[] = [];
		shared.viteConfig!.logger.warn = (msg: string) => warnings.push(msg);

		const replaceEnv = initReplaceEnv();
		replaceEnv('%VITE_MISSING%', '/project/index.php');

		expect(warnings.length).toBe(1);
		expect(warnings[0]).toInclude('%VITE_MISSING%');
	});

	it('parses import.meta.env.* values', async () => {
		shared.viteConfig = await mockConfig({
			define: {
				'import.meta.env.CUSTOM': '"defined-value"',
			},
		});

		const replaceEnv = initReplaceEnv();
		expect(replaceEnv('%CUSTOM%', '/project/index.php')).toBe(
			'defined-value',
		);
	});
});
