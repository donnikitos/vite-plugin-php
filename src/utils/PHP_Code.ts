import makeID from './makeID';
import initReplaceEnv from './replaceEnv';
import { readFile, writeFile } from './file';

const phpTagPattern = /<\?(?:php|).+?(\?>|$)/gis;

class PHP_Code {
	file: string = '!!__VIRTUAL__!!.php';
	code: string;
	mapping: Record<string, string> = {};

	static fromFile(file: string) {
		const inst = new this(readFile(file));
		inst.file = file;

		return inst;
	}
	constructor(code: string) {
		this.code = code;

		return this;
	}

	applyEnv() {
		const replaceEnv = initReplaceEnv();

		this.code = replaceEnv(this.code, this.file || '');

		return this;
	}

	escape() {
		const isJS = this.file.includes('.js') || this.file.includes('.ts');
		const isML = this.file.includes('.php') || this.file.includes('.htm');

		this.code = this.code.replace(phpTagPattern, (match) => {
			let token = makeID();

			if (isJS) {
				token = `/*${token}*/`;
			} else if (isML) {
				token = `␀␀${token}␀␀`;
			}

			this.mapping[token] = match;

			return token;
		});

		return this;
	}

	write(file: string, mapping = false) {
		writeFile(file, this.code);
		mapping && writeFile(file + '.json', JSON.stringify(this.mapping));
	}

	static unescape(code: string, mapping: Record<string, string>) {
		let out = code;

		Object.entries(mapping).forEach(([token, code]) => {
			out = out.replace(token, code);
		});

		return out;
	}
}

export default PHP_Code;
