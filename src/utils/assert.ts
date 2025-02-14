export function hasViteConfig(input: any): asserts input {
	if (!input) {
		throw new Error('Vite config not initialized!');
	}
}
