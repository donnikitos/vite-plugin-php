# dev

The `dev` option groups settings that only affect development mode.

## errorLevels

PHP errors that occur inside the internal PHP server are forwarded to the Vite console. Use `errorLevels` to control which severity levels are shown.

### Default

```js
import usePHP, { EPHPError } from 'vite-plugin-php';

usePHP({
	dev: {
		errorLevels: EPHPError.ALL | EPHPError.STRICT,
	},
});
```

### Show only errors and warnings

```js
import usePHP, { EPHPError } from 'vite-plugin-php';

usePHP({
	dev: {
		errorLevels: EPHPError.ERROR | EPHPError.WARNING,
	},
});
```

### Silence deprecation notices

```js
import usePHP, { EPHPError } from 'vite-plugin-php';

usePHP({
	dev: {
		errorLevels:
			EPHPError.ALL & ~EPHPError.DEPRECATED & ~EPHPError.USER_DEPRECATED,
	},
});
```

## cleanup

By default the plugin removes temporary files when the dev server shuts down. Set `cleanup` to `false` to keep them for debugging:

```js
usePHP({
	dev: {
		cleanup: false,
	},
});
```

This is useful if you want to inspect the transformed PHP that the internal server executed.

## Full dev example

```js
import { defineConfig } from 'vite';
import usePHP, { EPHPError } from 'vite-plugin-php';

export default defineConfig({
	plugins: [
		usePHP({
			dev: {
				errorLevels:
					EPHPError.ERROR | EPHPError.WARNING | EPHPError.STRICT,
				cleanup: true,
			},
		}),
	],
});
```
