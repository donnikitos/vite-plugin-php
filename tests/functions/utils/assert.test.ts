import { describe, it, expect } from 'bun:test';
import { hasViteConfig } from '../../../src/utils/assert';
import { resolveConfig } from 'vite';

describe('hasViteConfig', () => {
	it('does not throw for a resolved config', () => {
		expect(async () =>
			hasViteConfig(await resolveConfig({}, 'serve')),
		).not.toThrow();
		expect(async () =>
			hasViteConfig(await resolveConfig({}, 'build')),
		).not.toThrow();
	});

	it('throws for falsy values', () => {
		expect(() => hasViteConfig({})).toThrow('Vite config not initialized!');
		expect(() => hasViteConfig([])).toThrow('Vite config not initialized!');
		expect(() => hasViteConfig(undefined)).toThrow(
			'Vite config not initialized!',
		);
		expect(() => hasViteConfig(null)).toThrow(
			'Vite config not initialized!',
		);
		expect(() => hasViteConfig(false)).toThrow(
			'Vite config not initialized!',
		);
		expect(() => hasViteConfig(0)).toThrow('Vite config not initialized!');
		expect(() => hasViteConfig('')).toThrow('Vite config not initialized!');
	});
});
