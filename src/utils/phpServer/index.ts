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
				log(`Server started (PID: ${php.process?.pid})`);
			})
			.on('error', (error) => {
				log(`Server error: ${error.message})`, {
					type: 'error',
				});
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

function stop(callBack: () => void) {
	if (php.process) {
		php.process.on('close', (code) => {
			log('Ended with: ' + code);
			php.process = undefined;

			callBack();
		});

		php.process.stdin?.destroy();
		php.process.stdout?.destroy();
		php.process.stderr?.destroy();

		if (php.process.kill()) {
			log('Shutting down');
		} else {
			log('Failed to send SIGTERM', {
				type: 'error',
			});
		}
	} else {
		callBack();
	}
}

export default php;
