# php.host

The `php.host` option controls the host address of the internal PHP development server.

## Default

```js
usePHP();
// equivalent to
usePHP({
	php: { host: 'localhost' },
});
```

## Change the host

```js
usePHP({
	php: { host: '127.0.0.1' },
});
```

## Multiple projects in parallel

Each running Vite server gets a unique port automatically, so you can run several projects side by side. If you need to force a specific host, set it here. This is useful in containerized environments or when `localhost` resolves unexpectedly.

## Note on production builds

This option only affects the development server. Production builds do not start a PHP server; they write processed PHP files and assets to the output directory.
