import { shared } from '../shared';

function consoleHijack() {
	const entries = shared.entries;

	(['log', 'info', 'warn', 'error'] as const).forEach((command) => {
		const cx = console[command];

		console[command] = function (...args: any[]) {
			cx.apply(
				this,
				args.map((arg) =>
					typeof arg === 'string'
						? entries.reduce((acc, entry) => {
								return acc.replace(entry + '.html', entry);
						  }, arg)
						: arg,
				),
			);
		};
	});
}

export default consoleHijack;
