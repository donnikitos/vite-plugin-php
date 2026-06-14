# entry

The `entry` option defines which PHP files the plugin treats as application entry points.

## Single entry

```js
usePHP({
	entry: 'index.php',
});
```

This is the default. The file is served at `/` and built as `dist/index.php`.

## Multiple entries

```js
usePHP({
	entry: ['index.php', 'about.php', 'contact.php'],
});
```

Each entry gets its own route and build output. See the [routing table](../routing/) for details.

## Glob entries

For larger sites you can use globs to register many pages at once:

```js
usePHP({
	entry: ['index.php', 'pages/**/*.php', 'blog/*.php'],
});
```

The plugin resolves globs relative to the Vite project root. The matched files are treated the same as explicitly listed entries.

## Excluding files

The plugin automatically ignores the temporary directory and the build output directory. If you need to exclude additional files, use glob negation:

```js
usePHP({
	entry: ['pages/**/*.php', '!pages/admin/*.php'],
});
```

## Entry resolution order

Entries are resolved before Vite loads the project. Changing `entry` at runtime requires restarting the dev server.
