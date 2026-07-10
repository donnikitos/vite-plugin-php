import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanUp, ensurePluginBuilt, runBuild } from '../utils';

const fixtureDir = resolve(import.meta.dir);
const outFile = resolve(fixtureDir, 'dist/index.php');

describe('start-up build', () => {
	beforeAll(async () => {
		await ensurePluginBuilt();
		await runBuild(fixtureDir);
	});

	afterAll(() => {
		cleanUp(resolve(fixtureDir, 'dist'));
	});

	it('emits index.php', () => {
		expect(existsSync(outFile)).toBe(true);
	});

	it('preserves PHP tags in the output', () => {
		const content = readFileSync(outFile, 'utf-8');
		expect(content).toInclude("<?= 'Hi' ?>");
	});
});
