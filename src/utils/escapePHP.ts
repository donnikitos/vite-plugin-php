import { existsSync, readFileSync } from 'fs';
import makeID from './makeID';
import writeFile from './writeFile';

type CodeTokens = Record<string, string>;

export function escapePHP(inputFile: string, outputFile: string) {
	const input = readFileSync(inputFile).toString();

	const codeTokens: CodeTokens = {};

	const isJS = inputFile.includes('.js') || inputFile.includes('.ts');
	const isML = inputFile.includes('.php') || inputFile.includes('.htm');

	const out = input.replaceAll(/<\?(?:php|).+?\?>/gi, (match) => {
		let token = makeID();

		if (isJS) {
			token = `/*${token}*/`;
		} else if (isML) {
			token = `<!--${token}-->`;
		}

		codeTokens[token] = match;

		return token;
	});

	writeFile(outputFile + '.json', JSON.stringify(codeTokens));
	writeFile(outputFile, out);
}

export function unescapePHP(file: string) {
	const input = readFileSync(file).toString();
	let out = input;

	const tokensFile = file + '.json';
	if (existsSync(tokensFile)) {
		const codeTokens = JSON.parse(readFileSync(tokensFile).toString());

		Object.entries(codeTokens).forEach(([token, code]) => {
			out = out.replace(token, (match) => {
				return `${code}`;
			});
		});
	}

	return out;
}
