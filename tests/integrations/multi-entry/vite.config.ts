import { defineConfig } from 'vite';
import usePHP from '../../../dist/index.mjs';

export default defineConfig({
	plugins: [
		usePHP({
			entry: ['index.php', 'includes/**/*.php'],
		}),
	],
	server: { port: 3000 },
});
