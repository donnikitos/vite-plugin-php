import { ResolvedConfig } from "vite";

export const internalParam = '__314159265359__';

export const shared = {
	viteConfig: undefined as undefined | ResolvedConfig,
	entries: [] as string[],
	tempDir: '.php-tmp',
};
