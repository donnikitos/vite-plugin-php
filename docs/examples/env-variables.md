# Environment variables

The plugin replaces `%VAR_NAME%` placeholders in PHP files with values from Vite's environment.

## Default behavior

By default Vite exposes any variable starting with `VITE_` from `.env` files. The plugin replaces matching placeholders before PHP runs.

```ini
# .env
VITE_API_URL=https://api.example.com
VITE_APP_NAME=My PHP App
```

```php
<!-- index.php -->
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>%VITE_APP_NAME%</title>
	</head>
	<body>
		<script>
			window.API_URL = '%VITE_API_URL%';
		</script>
		<script src="./src/main.js" type="module"></script>
	</body>
</html>
```

## Custom envPrefix

If you want variables with a different prefix, set `envPrefix` in Vite:

```ts
export default defineConfig({
	envPrefix: 'APP_',
	plugins: [usePHP()],
});
```

Then use `%APP_API_URL%` in your PHP files.

## Using define

You can also set values via Vite's `define` option:

```ts
export default defineConfig({
	define: {
		'import.meta.env.BUILD_DATE': JSON.stringify(new Date().toISOString()),
	},
	plugins: [usePHP()],
});
```

Use `%BUILD_DATE%` in PHP.

## Private variables

Only variables matched by `envPrefix` are exposed. Values that do not match the prefix are left as-is and a warning is printed if they look like Vite env variables.

```ini
# .env
PRIVATE_TOKEN=do-not-expose
VITE_PUBLIC_KEY=safe-to-expose
```

```php
<p>Public key: %VITE_PUBLIC_KEY%</p>
<!-- %PRIVATE_TOKEN% stays literally in the output, no warning -->
```

## Build vs dev

Environment replacement happens during both development and production builds.
The final `dist/` files contain the replaced values, so never commit secrets into PHP files.
