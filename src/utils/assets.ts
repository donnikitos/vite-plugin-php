import makeID from './makeID';

const srcPattern = `(?:href|src)=['"]([^>]+?)['"]`;
const scriptTagRegex = new RegExp(
	`(<script[^>]+?(?:${srcPattern}|type=['"]module['"])[^>]*?(?:/|)>)`,
	'gis',
);
const linkTagRegex = new RegExp(
	`(<link[^>]+?(?:rel=['"]stylesheet['"]|${srcPattern})[^>]*?>)`,
	'gis',
);
const srcRegex = new RegExp(srcPattern, 'is');

class Assets {
	code: string;
	mapping: Record<string, string> = {};

	constructor(code: string) {
		this.code = code;

		return this;
	}

	escape() {
		this.code = this.code.replace(scriptTagRegex, (_, p1) => {
			const token = makeID();

			this.mapping[token] = p1.match(srcRegex)?.[1] || '';

			return `␀␀${token}␀␀${p1}/*${token}*/`;
		});

		this.code = this.code.replace(linkTagRegex, (match) => {
			const token = makeID();

			this.mapping[token] = match.match(srcRegex)?.[1] || '';

			return `␀␀${token}␀␀${match}`;
		});

		return this;
	}
}

export default Assets;
