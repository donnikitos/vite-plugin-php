import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanUp, ensurePluginBuilt, runBuild } from '../utils';

const fixtureDir = resolve(import.meta.dir);
const indexFile = resolve(fixtureDir, 'dist/index.php');
const includeFile = resolve(fixtureDir, 'dist/includes/test.php');

describe('multi-entry build', () => {
	beforeAll(async () => {
		await ensurePluginBuilt();
		await runBuild(fixtureDir);
	});

	afterAll(() => {
		cleanUp(resolve(fixtureDir, 'dist'));
	});

	it('emits index.php', () => {
		expect(existsSync(indexFile)).toBe(true);
	});

	it('emits includes/test.php', () => {
		expect(existsSync(includeFile)).toBe(true);
	});

	it('preserves PHP include tag in index.php', () => {
		const content = readFileSync(indexFile, 'utf-8');
		expect(content).toInclude("<?php include 'includes/test.php'; ?>");
	});

	it('preserves PHP echo in includes/test.php', () => {
		const content = readFileSync(includeFile, 'utf-8');
		expect(content).toBe(
			readFileSync(resolve(fixtureDir, 'includes/test.php'), 'utf-8'),
		);
	});
});
