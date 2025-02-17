const assetsPattern = new RegExp(
	/^(.+?)(<\?(?:php|)\s+namespace\s\S+?(?:\s*;|\s*{).+)$/,
	'si',
);

const lastTagPattern = new RegExp(/^(.+(?:<\/.+?>|<.+?\/>))(.+|)$/, 'si');
const closingPattern = new RegExp(/^(.+)(<\?(?:php|).+)$/, 'si');

export function fixAssetsInjection(input: string) {
	let out = input;
	let assets = '';

	out = out.replace(assetsPattern, (match, p1, p2) => {
		assets = p1.trim();

		return p2;
	});

	const injectAssets = (_: string, part1: string, part2: string) => {
		let a = assets;
		if (!(part1.endsWith('\n') || part1.endsWith('\r'))) {
			a = '\r\n' + a;
		}
		if (!(part2.startsWith('\n') || part2.startsWith('\r'))) {
			a += '\r\n';
		}
		assets = '';

		return `${part1}${a}${part2}`;
	};

	if (assets) {
		out = out.replace(lastTagPattern, injectAssets);
	}

	if (assets) {
		out = out.replace(closingPattern, injectAssets);
	}

	if (assets) {
		out += assets;
	}

	return out;
}
