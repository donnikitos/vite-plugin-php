import { describe, it, expect } from 'bun:test';
import escapeRegExp from '../../../src/utils/escapeRegExp';

describe('escapeRegExp', () => {
	it('escapes individual regex metacharacters', () => {
		const chars = ['.', '*', '+', '?', '^', '$', '{', '}', '(', ')', '|', '[', ']', '\\'];

		for (const char of chars) {
			expect(escapeRegExp(char)).toBe(`\\${char}`);
		}
	});

	it('escapes a mix of metacharacters', () => {
		expect(escapeRegExp('a.b*c+d?e^f$g{h}i(j)k|l[m]n\\o')).toBe(
			'a\\.b\\*c\\+d\\?e\\^f\\$g\\{h\\}i\\(j\\)k\\|l\\[m\\]n\\\\o',
		);
	});

	it('leaves plain strings unchanged', () => {
		expect(escapeRegExp('hello world')).toBe('hello world');
		expect(escapeRegExp('abc123')).toBe('abc123');
	});

	it('handles empty string', () => {
		expect(escapeRegExp('')).toBe('');
	});
});
