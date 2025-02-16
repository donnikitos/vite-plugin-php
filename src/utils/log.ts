import colors from 'picocolors';
import { hasViteConfig } from './assert';
import { shared } from '../shared';
import { EPHPError } from '../enums/php-error';
import { LogErrorOptions, LogType } from 'vite';
import { resolve } from 'node:path';

type LogOptions = Partial<
	{ type: LogType; prefix?: boolean } & LogErrorOptions
>;

function log(
	message: string,
	{ type = 'info', prefix = true, ...options }: LogOptions = {},
) {
	hasViteConfig(shared.viteConfig);

	let output = '';
	if (prefix) {
		output += colors.bgMagenta(colors.white(' php ')) + ' ';
	}
	output += message;

	shared.viteConfig.logger[type](output, options);
}

log.error = function (json: string, options: Omit<LogOptions, 'type'> = {}) {
	let output = json;
	let type: NonNullable<LogOptions['type']> = 'info';

	try {
		const data = JSON.parse(json);

		output = '';
		switch (data.code) {
			case EPHPError.PARSE:
			case EPHPError.ERROR:
			case EPHPError.CORE_ERROR:
			case EPHPError.COMPILE_ERROR:
			case EPHPError.USER_ERROR:
				type = 'error';
				output += colors.bgRedBright(colors.white('Fatal Error'));
				break;
			case EPHPError.WARNING:
			case EPHPError.USER_WARNING:
			case EPHPError.COMPILE_WARNING:
			case EPHPError.RECOVERABLE_ERROR:
				type = 'warn';
				output += colors.yellowBright('Warning');
				break;
			case EPHPError.NOTICE:
			case EPHPError.USER_NOTICE:
				type = 'info';
				output += colors.bgWhite(colors.black('Notice'));
				break;
			case EPHPError.STRICT:
				type = 'info';
				output += colors.yellow('Strict');
				break;
			case EPHPError.DEPRECATED:
			case EPHPError.USER_DEPRECATED:
				type = 'info';
				output += colors.cyan('Deprecated');
				break;
			default:
				break;
		}

		output += ' ' + data.message + '\r\n';
		output +=
			'\tIn: ' +
			data.file.replace(
				resolve(shared.tempDir),
				shared.viteConfig?.root,
			) +
			'\r\n';
		output += '\tOn line: ' + data.line;
	} catch (error) {}

	log(output, { ...options, type });
};

export default log;
