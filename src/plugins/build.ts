import type { Plugin } from 'vite';
import { shared } from '../shared';
import PHP_Code from '../utils/PHP_Code';
import { fixAssetsInjection } from '../utils/fixAssetsInjection';

const entryMap = new Map<string, string>();
const codeMap = new Map<string, Record<string, string>>();

const buildPlugin: Plugin[] = [
	{
		name: 'php:build-load',
		apply: 'build',
		enforce: 'pre',
		resolveId: {
			handler(source, importer, options) {
				if (shared.entries.includes(source)) {
					// Rename ids because Vite transforms only .html files: https://github.com/vitejs/vite/blob/0cde495ebeb48bcfb5961784a30bfaed997790a0/packages/vite/src/node/plugins/html.ts#L330
					const id = `${source}.html`;

					entryMap.set(id, source);

					return {
						id,
						resolvedBy: 'vite-plugin-php',
					};
				}
			},
		},
		load: {
			handler(id, options) {
				const entry = entryMap.get(id);

				if (entry) {
					const php = PHP_Code.fromFile(entry);

					return {
						code: php.code,
					};
				}
			},
		},
	},
	{
		name: 'php:build-escape',
		apply: 'build',
		transformIndexHtml: {
			order: 'pre',
			handler(html, ctx) {
				const entry = entryMap.get(ctx.filename);

				if (entry) {
					ctx.filename = entry;

					const php = new PHP_Code(html);
					php.file = entry;
					php.applyEnv();
					php.escape();
					codeMap.set(entry, php.mapping);

					return php.code;
				}
			},
		},
	},
	{
		name: 'php:build-unescape',
		apply: 'build',
		enforce: 'post',
		transformIndexHtml: {
			order: 'post',
			handler(html, ctx) {
				const entry = entryMap.get(ctx.filename);

				if (entry) {
					const escapes = codeMap.get(entry);

					if (escapes) {
						let php = PHP_Code.unescape(html, escapes);
						php = fixAssetsInjection(php);

						return php;
					}
				}
			},
		},
	},
	{
		name: 'php:build-bundle',
		apply: 'build',
		enforce: 'post',
		generateBundle: {
			order: 'post',
			handler(options, bundle, isWrite) {
				Object.entries(bundle).forEach(([key, item]) => {
					if (item.type === 'asset') {
						const entry = entryMap.get(item.fileName);

						if (entry) {
							item.fileName = entry;
						}
					} else if (item.type === 'chunk' && item.facadeModuleId) {
						const entry = entryMap.get(item.facadeModuleId);

						if (entry) {
							const escapes = codeMap.get(entry);

							if (escapes) {
								item.code = PHP_Code.unescape(
									item.code,
									escapes,
								);
							}
						}
					}
				});
			},
		},
	},
];

export default buildPlugin;
