# binary

The `binary` option tells the plugin which PHP executable to use for the internal development server.

## Default

```js
usePHP();
```

Without a value the plugin runs the `php` command from your system `PATH`. Make sure `php -v` works in your terminal.

## Custom path

If you have PHP installed in a non-standard location, or you want to pin a specific version, pass the full path:

```js
usePHP({
	binary: '/opt/lampp/bin/php-8.2.0',
});
```

On macOS with a Homebrew PHP:

```js
usePHP({
	binary: '/opt/homebrew/bin/php',
});
```

On Windows use forward slashes or double backslashes:

```js
usePHP({
	binary: 'C:\\\\xampp\\\\php\\\\php.exe',
});
```

## Version notes

The plugin uses PHP's built-in development server (`php -S`). Any PHP version that ships with this server works. The plugin has been tested with PHP 8.0 and newer.

## Debugging

If the dev server fails to start, the plugin logs the error in the Vite console. First checks:

- Is the path correct? Run the value directly in your terminal.
- Is the binary executable?
- Does your PHP install include the CLI SAPI? (`php -v` should show `cli`.)
