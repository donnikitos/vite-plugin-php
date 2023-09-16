import { spawn } from 'child_process';

function start(root: string) {
	if (!globalThis.php?.pid) {
		const routerFileUrl = new URL('./router.php', import.meta.url);

		globalThis.php = spawn(phpServer.binary, [
			'-S',
			'localhost:' + phpServer.port,
			'-t',
			root,
			decodeURI(routerFileUrl.pathname),
		])
			.once('spawn', () => {
				console.log(
					`PHP development server started (PID: ${globalThis.php?.pid})`,
				);
			})
			.on('error', (error) => {
				console.error('PHP dev-server error: ' + error.message);
			})
			.on('close', (code) => {
				console.log(`PHP development server stopped (Code: ${code})`);
			});
	}
}

function stop() {
	if (globalThis.php) {
		globalThis.php.stdin?.end();
		globalThis.php.stdout?.destroy();
		globalThis.php.stderr?.destroy();

		if (globalThis.php.kill()) {
			console.log('PHP development server killed');
		} else {
			console.error('Attention! Failed to kill PHP development server!');
		}
	}
}

const phpServer = {
	binary: 'php',
	port: 65535,
	start,
	stop,
};

export default phpServer;
