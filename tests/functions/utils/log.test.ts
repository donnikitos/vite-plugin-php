import { describe, it, expect, beforeEach } from 'bun:test';
import log from '../../../src/utils/log';
import { shared } from '../../../src/shared';
import { EPHPError } from '../../../src/enums/php-error';
import { resolveConfig } from 'vite';

describe('log', () => {
	let calls: { type: string; message: string }[] = [];

	beforeEach(async () => {
		calls = [];
		shared.viteConfig = await resolveConfig({}, 'build');
		shared.viteConfig.logger.info = (msg: string) =>
			calls.push({ type: 'info', message: msg });
		shared.viteConfig.logger.warn = (msg: string) =>
			calls.push({ type: 'warn', message: msg });
		shared.viteConfig.logger.error = (msg: string) =>
			calls.push({ type: 'error', message: msg });
	});

	it('forwards messages to the Vite logger with prefix', () => {
		log('hello');
		expect(calls.length).toBe(1);
		expect(calls[0].type).toBe('info');
		expect(calls[0].message).toInclude('hello');
		expect(calls[0].message).toInclude('php');
	});

	it('supports error type', () => {
		log('oops', { type: 'error' });
		expect(calls[0].type).toBe('error');
	});

	it('log.error parses PHP fatal error JSON', () => {
		log.error(
			JSON.stringify({
				code: EPHPError.ERROR,
				message: 'Something broke',
				file: '/project/.php-tmp/index.php',
				line: 42,
			}),
		);

		expect(calls.length).toBe(1);
		expect(calls[0].type).toBe('error');
		expect(calls[0].message).toInclude('Something broke');
		expect(calls[0].message).toInclude('index.php');
		expect(calls[0].message).toInclude('42');
	});

	it('log.error parses PHP warning JSON', () => {
		log.error(
			JSON.stringify({
				code: EPHPError.WARNING,
				message: 'Deprecated call',
				file: '/project/.php-tmp/index.php',
				line: 1,
			}),
		);

		expect(calls[0].type).toBe('warn');
		expect(calls[0].message).toInclude('Deprecated call');
	});

	it('log.error does not throw on invalid JSON', () => {
		expect(() => log.error('not json')).not.toThrow();
		expect(calls.length).toBe(1);
	});
});
