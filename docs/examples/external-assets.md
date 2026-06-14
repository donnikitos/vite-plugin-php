# External assets

Serve selected assets from an external origin during development. This is helpful when your production media lives on a CDN or another service.

## Scenario

Your PHP app references user uploads at `/uploads/avatar.jpg`, but during local development those files are stored on a remote staging server.

## vite.config.js

```js
import { defineConfig } from 'vite';
import usePHP from 'vite-plugin-php';

export default defineConfig({
	plugins: [
		usePHP({
			rewriteUrl(requestUrl) {
				if (requestUrl.pathname.startsWith('/uploads/')) {
					return new URL(
						'https://cdn.example.com' +
							requestUrl
								.toString()
								.substring(requestUrl.origin.length),
					);
				}
			},
		}),
	],
});
```

## index.php

```php
<img src="/uploads/avatar.jpg" alt="Avatar" />
```

When you open the page, the browser receives a `307` redirect to `https://cdn.example.com/uploads/avatar.jpg`.

## API proxy

The same technique works for API calls:

```js
usePHP({
	rewriteUrl(requestUrl) {
		if (requestUrl.pathname.startsWith('/api/')) {
			return new URL(
				'https://api.example.com' +
					requestUrl
						.toString()
						.substring(requestUrl.origin.length + 4),
			);
		}
	},
});
```

`/api/users` is redirected to `https://api.example.com/users`.

## Note on production

`rewriteUrl` only runs during development. In production you will typically configure your host, CDN or reverse proxy to handle these routes.
