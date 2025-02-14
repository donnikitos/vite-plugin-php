import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const php = {
	binary: 'php',
	port: 65535,
	process: undefined as undefined | ReturnType<typeof spawn>,
	start,
	stop,
};

function start(root: string) {
	if (!php.process?.pid) {
		const routerFileUrl = new URL('./router.php', import.meta.url);

		php.process = spawn(php.binary, [
			'-S',
			'localhost:' + php.port,
			'-t',
			root,
			fileURLToPath(routerFileUrl),
		])
			.once('spawn', () => {
				console.log(
					`PHP development server started (PID: ${php.process?.pid})`,
				);
			})
			.on('error', (error) => {
				console.error('PHP dev-server error: ' + error.message);
			})
			.on('close', (code) => {
				console.log(`PHP development server stopped (Code: ${code})`);
			})
			.on('exit', (code) => {
				console.log(`PHP development server exited (Code: ${code})`);
			});
	}
}

function stop() {
	if (php.process) {
		php.process.stdin?.destroy();
		php.process.stdout?.destroy();
		php.process.stderr?.destroy();

		if (php.process.kill()) {
			console.log('PHP development server killed');
		} else {
			console.error('Attention! Failed to kill PHP development server!');
		}
	}
}

export default php;
