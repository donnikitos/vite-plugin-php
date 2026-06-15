import { beforeAll, afterAll } from 'bun:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

export let tmpDir: string;

beforeAll(() => {
	tmpDir = mkdtempSync(resolve(tmpdir(), 'vite-plugin-php-test-'));
	console.log(`Temp dir: ${tmpDir}`);
});

afterAll(() => {
	rmSync(tmpDir, { recursive: true, force: true });
});
