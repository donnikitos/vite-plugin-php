import { describe, it, expect } from 'bun:test';
import makeID from '../../../src/utils/makeID';

describe('makeID', () => {
	it('returns a non-empty string', () => {
		const id = makeID();
		expect(typeof id).toBe('string');
		expect(id.length).toBeGreaterThan(0);
	});

	it('returns different values on successive calls', () => {
		const a = makeID();
		const b = makeID();
		expect(a).not.toBe(b);
	});

	it('contains only base36 characters and digits', () => {
		const id = makeID();
		expect(id).toMatch(/^[a-z0-9.]+$/);
	});
});
