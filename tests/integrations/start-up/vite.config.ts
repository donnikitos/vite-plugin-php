import { defineConfig } from 'vite';
import usePHP from '../../../dist/index.mjs';

console.log(import.meta.dirname);

export default defineConfig({
	plugins: [usePHP()],
	server: { port: 3000 },
});
