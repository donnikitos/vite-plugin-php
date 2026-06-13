import { describe, it, expect, afterEach } from 'bun:test';
import handleExit, { exitSignals } from '../../../src/utils/handleExit';

describe('handleExit', () => {
	afterEach(() => {
		handleExit.unregister();
	});

	it('registers listeners for all exit signals', () => {
		const initialCounts = exitSignals.map(
			(signal) => process.listenerCount(signal),
		);

		handleExit.register();

		exitSignals.forEach((signal, i) => {
			expect(process.listenerCount(signal)).toBe(initialCounts[i] + 1);
		});
	});

	it('unregisters previously registered listeners', () => {
		const initialCounts = exitSignals.map(
			(signal) => process.listenerCount(signal),
		);

		handleExit.register();
		handleExit.unregister();

		exitSignals.forEach((signal, i) => {
			expect(process.listenerCount(signal)).toBe(initialCounts[i]);
		});
	});
});
