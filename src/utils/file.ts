import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export function readFile(file: string) {
	return readFileSync(file, 'utf-8').toString();
}

export function writeFile(file: string, data: string) {
	mkdirSync(dirname(file), { recursive: true });
	writeFileSync(file, data);
}
