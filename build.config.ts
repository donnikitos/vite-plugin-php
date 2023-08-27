import { cp } from 'fs';
import { resolve } from 'path';
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
				resolve('./src/utils/phpServer/router.php'),
				buildConfig.options.outDir + '/router.php',
				console.log,
			);
		},
	},
});
