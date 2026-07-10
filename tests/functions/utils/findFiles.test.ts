import { describe, it, expect } from 'bun:test';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import findFiles from '../../../src/utils/findFiles';
import { tmpDir } from '../../setup';

describe('findFiles', () => {
	it('finds files matching a single glob pattern', () => {
		const dir = join(tmpDir, 'single-glob');
		const file = join(dir, 'file.txt');
		mkdirSync(dir, { recursive: true });
		writeFileSync(file, 'content', 'utf-8');

		const result = findFiles(['*.txt'], dir);

		expect(result).toContain('file.txt');
	});

	it('finds files matching multiple glob patterns', () => {
		const dir = join(tmpDir, 'multi-glob');
		mkdirSync(dir, { recursive: true });
		writeFileSync(join(dir, 'a.txt'), 'a', 'utf-8');
		writeFileSync(join(dir, 'b.md'), 'b', 'utf-8');

		const result = findFiles(['*.txt', '*.md'], dir);

		expect(result).toContain('a.txt');
		expect(result).toContain('b.md');
	});

	it('de-duplicates files matched by multiple patterns', () => {
		const dir = join(tmpDir, 'dedupe');
		mkdirSync(dir, { recursive: true });
		writeFileSync(join(dir, 'file.txt'), 'content', 'utf-8');

		const result = findFiles(['*.txt', 'file.*'], dir);

		expect(result).toEqual(['file.txt']);
	});

	it('respects the ignore option', () => {
		const dir = join(tmpDir, 'ignored');
		const nested = join(dir, 'nested');
		mkdirSync(nested, { recursive: true });
		writeFileSync(join(dir, 'keep.txt'), 'keep', 'utf-8');
		writeFileSync(join(nested, 'skip.txt'), 'skip', 'utf-8');

		const result = findFiles(['**/*.txt'], dir, ['nested/**']);

		expect(result).toContain('keep.txt');
		expect(result).not.toContain('nested/skip.txt');
	});

	it('uses the provided root directory', () => {
		const dir = join(tmpDir, 'custom-root');
		mkdirSync(dir, { recursive: true });
		writeFileSync(join(dir, 'rooted.txt'), 'content', 'utf-8');

		const result = findFiles(['*.txt'], dir);

		expect(result).toContain('rooted.txt');
	});

	it('returns an empty array when nothing matches', () => {
		const dir = join(tmpDir, 'empty');
		mkdirSync(dir, { recursive: true });

		const result = findFiles(['*.missing'], dir);

		expect(result).toEqual([]);
	});
});
