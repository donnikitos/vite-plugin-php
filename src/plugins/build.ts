import { Plugin } from 'vite';
import { shared } from '../shared';
import { escapePHP, unescapePHP } from '../utils/escapePHP';
import { fixAssetsInjection } from '../utils/fixAssetsInjection';

const buildPlugin: Plugin = {
	name: 'build-php',
	apply: 'build',
	enforce: 'pre',
	resolveId(source, importer, options) {
		if (shared.entries.includes(source)) {
			return {
				// Rename ids because Vite transforms only .html files: https://github.com/vitejs/vite/blob/0cde495ebeb48bcfb5961784a30bfaed997790a0/packages/vite/src/node/plugins/html.ts#L330
				id: `${source}.html`,
				resolvedBy: 'vite-plugin-php',
				meta: {
					originalId: source,
				},
			};
		}
	},
	load(id, options) {
		const entry = this.getModuleInfo(id)?.meta.originalId;

		if (entry) {
			const { escapedCode, phpCodes } = escapePHP(entry);

			return {
				code: escapedCode,
				meta: { phpCodes },
			};
		}
	},
	generateBundle: {
		order: 'post',
		handler(options, bundle, isWrite) {
			Object.entries(bundle).forEach(([key, item]) => {
				if (item.type === 'asset') {
					const meta = this.getModuleInfo(item.fileName)?.meta;

					if (meta?.originalId && meta?.phpCodes) {
						item.fileName = meta.originalId;

						item.source = unescapePHP({
							escapedCode: item.source.toString(),
							phpCodes: meta.phpCodes,
						});
						item.source = fixAssetsInjection(item.source);
					}
				} else if (item.type === 'chunk' && item.facadeModuleId) {
					const meta = this.getModuleInfo(item.facadeModuleId)?.meta;

					if (meta?.phpCodes) {
						item.code = unescapePHP({
							escapedCode: item.code,
							phpCodes: meta.phpCodes,
						});
						item.code = fixAssetsInjection(item.code);
					}
				}
			});
		},
	},
};

export default buildPlugin;
