import { type ResolvedConfig } from 'vite';

export function hasViteConfig(input: any): asserts input is ResolvedConfig {
	if (
		!input ||
		typeof input !== 'object' ||
		['logger', 'server'].some((key) => !(key in input))
	) {
		throw new Error('Vite config not initialized!');
	}
}
