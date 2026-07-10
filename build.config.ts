import { cp } from 'node:fs';
import { resolve } from 'node:path';
import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
	entries: ['src/index'],
	externals: ['vite'],
	clean: true,
	declaration: true,
	rollup: {
		emitCJS: true,
		inlineDependencies: true,
	},
	hooks: {
		'build:done': (buildConfig) => {
			cp(
				resolve('./src/utils/PHP_Server/router.php'),
				buildConfig.options.outDir + '/router.php',
				console.log,
			);
		},
	},
});
