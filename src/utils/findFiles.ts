import FastGlob from 'fast-glob';

function findFiles(
	pattern: string[],
	root: string = process.cwd(),
	ignore?: string[],
) {
	return [
		...new Set(
			pattern.flatMap((entry) =>
				FastGlob.globSync(entry, {
					cwd: root,
					dot: true,
					onlyFiles: true,
					unique: true,
					ignore,
				}),
			),
		),
	];
}

export default findFiles;
