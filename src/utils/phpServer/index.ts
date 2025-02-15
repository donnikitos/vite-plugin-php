import { spawn } from 'node:child_process';
import { fileURLToPath } from 'url';
import { internalParam } from '../../shared';
import log from '../log';

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
				log(`Development server started (PID: ${php.process?.pid})`);
			})
			.on('error', (error) => {
				log(`Development server error: ${error.message})`, {
					type: 'error',
				});
			})
			.on('close', (code) => {
				log(`PHP development server stopped (Code: ${code})`);
			})
			.on('exit', (code) => {
				log(`PHP development server exited (Code: ${code})`);
			});

		php.process.stdout?.on('data', (data) => {
			`${data}`
				.trim()
				.split('\r\n')
				.forEach((line) => {
					if (line.startsWith(internalParam + ':')) {
						log.error(line.substring((internalParam + ':').length));
					} else {
						log(line);
					}
				});
		});
	}
}

function stop() {
	if (php.process) {
		php.process.stdin?.destroy();
		php.process.stdout?.destroy();
		php.process.stderr?.destroy();

		if (php.process.kill()) {
			log('PHP development server killed');
		} else {
			log('Attention! Failed to kill PHP development server!', {
				type: 'error',
			});
		}
	}
}

export default php;
