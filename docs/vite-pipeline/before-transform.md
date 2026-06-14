# Before PHP transform

Registering a plugin before `usePHP()` lets you modify the raw source before the plugin escapes PHP fragments and runs Vite's HTML transforms.

## When to use this

- Inject shared PHP variables or configuration into every entry.
- Add server-side logic that should be evaluated by PHP.
- Pre-process the PHP source based on the request context.

## Example: inject a PHP config block

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import usePHP from 'vite-plugin-php';

export default defineConfig({
	plugins: [
		{
			name: 'inject-config',
			transformIndexHtml: {
				order: 'pre',
				handler(html, ctx) {
					return html.replace(
						'</body>',
						`<?php $appVersion = '${process.env.npm_package_version}'; ?>\n</body>`,
					);
				},
			},
		},
		usePHP(),
	],
});
```

Because this plugin runs before `usePHP()` with `order: 'pre'`, the injected PHP code will be escaped, survive Vite transforms and eventually be executed by the PHP server.

## Example: conditional environment banner

```ts
{
	name: 'env-banner',
	transformIndexHtml: {
		order: 'pre',
		handler(html, ctx) {
			if (process.env.NODE_ENV === 'development') {
				return html.replace(
					'</body>',
					`<div style="background:red;color:white;padding:0.5rem;">DEV MODE</div>\n</body>`,
				);
			}
		},
	},
}
```

## Important caveat

The raw source at this point still contains the original PHP tags. Returning plain HTML that contains `<?php ... ?>` is fine because the plugin will escape it next.
