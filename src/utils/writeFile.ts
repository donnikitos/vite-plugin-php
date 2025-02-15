import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

function writeFile(file: string, data: string) {
	mkdirSync(dirname(file), { recursive: true });
	writeFileSync(file, data);
}

export default writeFile;
