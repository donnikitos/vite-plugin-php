import { describe, it, expect } from 'bun:test';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { readFile, writeFile, tempName } from '../../../src/utils/file';
import { shared } from '../../../src/shared';
import { tmpDir } from '../../setup';

describe('file utils', () => {
	it('readFile returns file contents', () => {
		const file = join(tmpDir, 'hello.txt');
		writeFile(file, 'hello world');
		expect(readFile(file)).toBe('hello world');
	});

	it('writeFile creates missing directories', () => {
		const file = join(tmpDir, 'a', 'b', 'c.txt');
		expect(existsSync(file)).toBe(false);
		writeFile(file, 'nested');
		expect(existsSync(file)).toBe(true);
		expect(readFile(file)).toBe('nested');
	});

	it('tempName uses shared.tempDir', () => {
		shared.tempDir = '.custom-tmp';
		expect(tempName('index.php')).toBe('.custom-tmp/index.php');
	});
});
