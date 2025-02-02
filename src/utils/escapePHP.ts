import { readFileSync } from 'fs';
import makeID from './makeID';
import { ResolvedConfig } from 'vite';
import initReplaceEnv from './replaceEnv';
import writeFile from './writeFile';

const phpTagPattern = /<\?(?:php|).+?(\?>|$)/gis;

type EscapePHPArgs = {
	inputFile: string;
	config: ResolvedConfig;
};

export function escapePHP({ inputFile, config }: EscapePHPArgs) {
	const replaceEnv = initReplaceEnv(config);

	const input = readFileSync(inputFile, 'utf-8').toString();

	const phpCodes: Record<string, string> = {};

	const isJS = inputFile.includes('.js') || inputFile.includes('.ts');
	const isML = inputFile.includes('.php') || inputFile.includes('.htm');

	const escapedCode = input.replace(phpTagPattern, (match) => {
		let token = makeID();

		if (isJS) {
			token = `/*${token}*/`;
		} else if (isML) {
			token = `␀␀${token}␀␀`;
		}

		phpCodes[token] = replaceEnv(match, inputFile);

		return token;
	});

	return {
		escapedCode,
		phpCodes,
		write(outputFile: string) {
			writeFile(outputFile, escapedCode);
			writeFile(outputFile + '.json', JSON.stringify(phpCodes));
		},
	} as const;
}

type UnescapePHPArgs = {
	escapedCode: string;
	phpCodes: Record<string, string>;
};

export function unescapePHP({ escapedCode, phpCodes }: UnescapePHPArgs) {
	let out = escapedCode;

	Object.entries(phpCodes).forEach(([token, code]) => {
		out = out.replace(token, (match) => {
			return `${code}`;
		});
	});

	return out;
}
