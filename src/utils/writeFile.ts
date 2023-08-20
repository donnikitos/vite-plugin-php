import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';

function writeFile(file: string, data: string) {
	mkdirSync(dirname(file), { recursive: true });
	writeFileSync(file, data);
}

export default writeFile;
