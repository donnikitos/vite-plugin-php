import { spawn } from 'node:child_process';
import { fileURLToPath } from 'url';
import { internalParam, shared } from '../../shared';
import log from '../log';
import tcpPortUsed from 'tcp-port-used';

const PHP_Server = {
	binary: 'php',
	host: 'localhost',
	port: 6535,
	process: undefined as undefined | ReturnType<typeof spawn>,
	start,
	stop,
};

async function start(root = shared.projectRoot) {
	if (!PHP_Server.process?.pid) {
		await new Promise<number | undefined>(async (resolve, reject) => {
			const routerFileUrl = new URL('./router.php', import.meta.url);

			while (await tcpPortUsed.check(PHP_Server.port, PHP_Server.host)) {
				PHP_Server.port++;
			}

			PHP_Server.process = spawn(PHP_Server.binary, [
				'-S',
				`${PHP_Server.host}:${PHP_Server.port}`,
				'-t',
				root,
				fileURLToPath(routerFileUrl),
			])
				.once('spawn', () => {
					log(`Server started (PID: ${PHP_Server.process?.pid})`);

					resolve(PHP_Server.process?.pid);
				})
				.on('error', (error) => {
					log(`Server error: ${error.message})`, {
						type: 'error',
					});

					reject(error);
				});

			PHP_Server.process.stdout?.on('data', (data) => {
				log('', { timestamp: true });

				`${data}`
					.trim()
					.split('\r\n')
					.forEach((line) => {
						if (line.startsWith(internalParam + ':')) {
							log.error(
								line.substring((internalParam + ':').length),
								{ prefix: false },
							);
						} else {
							log(line);
						}
					});
			});
		});
	}
}

function stop(callBack: () => void) {
	if (PHP_Server.process) {
		PHP_Server.process.on('close', (code) => {
			log('Ended with: ' + code);
			PHP_Server.process = undefined;

			callBack();
		});

		PHP_Server.process.stdin?.destroy();
		PHP_Server.process.stdout?.destroy();
		PHP_Server.process.stderr?.destroy();

		if (PHP_Server.process.kill()) {
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

export default PHP_Server;
