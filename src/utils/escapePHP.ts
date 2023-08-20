import { readFileSync } from 'fs';
import makeID from './makeID';
import { resolve } from 'path';
import writeFile from './writeFile';

export const codeTokens: Map<string, Map<string, string>> = new Map();

export function escapePHP(inputFile: string, outputFile: string) {
	const fileId = resolve(outputFile);
	const input = readFileSync(inputFile).toString();

	if (input.includes('<?') && !codeTokens.has(fileId)) {
		codeTokens.set(fileId, new Map());
	}
	const fileTokens = codeTokens.get(fileId)!;

	const out = input.replaceAll(/<\?(?:php|)(.+?)\?>/gi, (match) => {
		let token = makeID();

		if (inputFile.includes('.js') || inputFile.includes('.ts')) {
			token = `/*${token}*/`;
		} else if (inputFile.includes('.php') || inputFile.includes('.htm')) {
			token = `<!--${token}-->`;
		}

		fileTokens.set(token, match);

		return token;
	});

	writeFile(outputFile, out);
}

export function unescapePHP(file: string) {
	const fileId = resolve(file);
	const input = readFileSync(file).toString();
	const fileTokens = codeTokens.get(fileId);
	let out = input;

	if (fileTokens) {
		fileTokens.forEach((code, token) => {
			out = out.replace(token, (match) => {
				return code;
			});
		});
	}

	return out;
}
