import { spawn } from 'child_process';

declare global {
	export var php: undefined | ReturnType<typeof spawn>;
}
