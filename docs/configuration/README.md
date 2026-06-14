# Configuration

The plugin is configured by passing an object to `usePHP()`.

```ts
import { defineConfig } from 'vite';
import usePHP, { EPHPError } from 'vite-plugin-php';

export default defineConfig({
	plugins: [
		usePHP({
			binary: 'php',
			php: { host: 'localhost' },
			entry: 'index.php',
			tempDir: '.php-tmp',
			dev: {
				errorLevels: EPHPError.ALL,
				cleanup: true,
			},
		}),
	],
});
```

## Options reference

| Option            | Type                                    | Default                             | Description                                        |
| ----------------- | --------------------------------------- | ----------------------------------- | -------------------------------------------------- |
| `binary`          | `string`                                | `'php'`                             | Path or command used to start the PHP binary.      |
| `php.host`        | `string`                                | `'localhost'`                       | Host address used by the internal PHP dev server.  |
| `entry`           | `string \| string[]`                    | `'index.php'`                       | Entry PHP file(s). Supports globs.                 |
| `rewriteUrl`      | `(requestUrl: URL) => URL \| undefined` | identity function                   | Rewrite incoming dev URLs before proxying to PHP.  |
| `tempDir`         | `string`                                | `'.php-tmp'`                        | Folder for temporary PHP files during development. |
| `dev.errorLevels` | `number`                                | `EPHPError.ALL \| EPHPError.STRICT` | Bitmask controlling which PHP errors are logged.   |
| `dev.cleanup`     | `boolean`                               | `true`                              | Whether to clean up temporary files on shutdown.   |

## PHP error constants

The `EPHPError` export mirrors PHP's internal error constants. Combine them with bitwise OR:

```js
import usePHP, { EPHPError } from 'vite-plugin-php';

usePHP({
	dev: {
		errorLevels: EPHPError.ERROR | EPHPError.WARNING | EPHPError.STRICT,
	},
});
```

| Constant            | Value |
| ------------------- | ----- |
| `ERROR`             | 1     |
| `WARNING`           | 2     |
| `PARSE`             | 4     |
| `NOTICE`            | 8     |
| `CORE_ERROR`        | 16    |
| `CORE_WARNING`      | 32    |
| `COMPILE_ERROR`     | 64    |
| `COMPILE_WARNING`   | 128   |
| `USER_ERROR`        | 256   |
| `USER_WARNING`      | 512   |
| `USER_NOTICE`       | 1024  |
| `STRICT`            | 2048  |
| `RECOVERABLE_ERROR` | 4096  |
| `DEPRECATED`        | 8192  |
| `USER_DEPRECATED`   | 16384 |
| `ALL`               | 32767 |

For the full meaning of each constant see the [PHP documentation](https://www.php.net/manual/en/errorfunc.constants.php).

## Detailed guides

- [binary](./binary.md) — custom PHP binary path and version notes.
- [php.host](./php-host.md) — host address and running multiple projects.
- [entry](./entry.md) — single entries, arrays and globs.
- [rewriteUrl](./rewriteUrl.md) — URL rewriting for dev mode.
- [tempDir](./tempDir.md) — temporary directory layout.
- [dev](./dev.md) — error reporting and cleanup behavior.
