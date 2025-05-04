import { ResolvedConfig } from 'vite';
import { UsePHPConfig } from '.';
import { EPHPError } from './enums/php-error';

export const internalParam = '__314159265359__';

export const shared = {
	projectRoot: process.cwd(),
	viteConfig: undefined as undefined | ResolvedConfig,
	devConfig: {
		cleanup: true,
		errorLevels: EPHPError.ALL | EPHPError.STRICT,
	} as NonNullable<Required<UsePHPConfig['dev']>>,
	entries: [] as string[],
	tempDir: '.php-tmp',
};
