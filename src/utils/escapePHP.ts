import { existsSync, readFileSync } from 'fs';
import makeID from './makeID';
import writeFile from './writeFile';
import { ResolvedConfig } from 'vite';
import initReplaceEnv from './replaceEnv';

const phpTagPattern = /<\?(?:php|).+?(\?>|$)/gis;

type EscapePHPArgs = {
	inputFile: string;
	outputFile: string;
	config: ResolvedConfig;
};

export function escapePHP({ inputFile, outputFile, config }: EscapePHPArgs) {
	const replaceEnv = initReplaceEnv(config);

	const input = readFileSync(inputFile).toString();

	const codeTokens: Record<string, string> = {};

	const isJS = inputFile.includes('.js') || inputFile.includes('.ts');
	const isML = inputFile.includes('.php') || inputFile.includes('.htm');

	const out = input.replace(phpTagPattern, (match) => {
		let token = makeID();

		if (isJS) {
			token = `/*${token}*/`;
		} else if (isML) {
			token = `<!--${token}-->`;
		}

		codeTokens[token] = replaceEnv(match, inputFile);

		return token;
	});

	writeFile(outputFile + '.json', JSON.stringify(codeTokens));
	writeFile(outputFile, out);
}

type UnescapePHPArgs = { file: string; tokensFile?: string };

export function unescapePHP({ file, tokensFile }: UnescapePHPArgs) {
	const input = readFileSync(file).toString();
	let out = input;

	const tknsFile = tokensFile || file + '.json';
	if (existsSync(tknsFile)) {
		const codeTokens = JSON.parse(readFileSync(tknsFile).toString());

		Object.entries(codeTokens).forEach(([token, code]) => {
			out = out.replace(token, (match) => {
				return `${code}`;
			});
		});
	}

	return out;
}
