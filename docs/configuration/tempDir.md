# tempDir

The `tempDir` option controls where the plugin writes temporary PHP files during development.

## Default

```js
usePHP();
// equivalent to
usePHP({
	tempDir: '.php-tmp',
});
```

## Custom directory

```js
usePHP({
	tempDir: 'tmp/php',
});
```

## What goes into this folder

During development the plugin escapes PHP fragments, runs Vite transforms and writes the result into the temporary directory. A `.gitignore` file is automatically created inside it so the contents are never committed.

## Cleanup

By default the contents are cleaned up when the dev server shuts down. You can disable this with the `dev.cleanup` option:

```js
usePHP({
	dev: {
		cleanup: false,
	},
});
```

## Why it exists

PHP is executed by a separate PHP development server. That server needs real `.php` files on disk, so the plugin prepares transformed copies in `tempDir` and asks the PHP server to run them.
