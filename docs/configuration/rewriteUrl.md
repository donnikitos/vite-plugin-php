# rewriteUrl

The `rewriteUrl` option lets you rewrite incoming dev-server URLs before they are proxied to PHP. This is useful when you want to simulate Apache `mod_rewrite` or nginx rewrite rules without configuring a full web server.

## Signature

```ts
type RewriteUrl = (requestUrl: URL) => URL | undefined;
```

Return a modified URL to route the request elsewhere. Return `undefined` to let the request continue unchanged.

## Simple rewrite

Forward every non-asset request to `index.php`, a common pattern for single-page applications:

```js
usePHP({
	entry: ['index.php', 'partials/**/*.php'],
	rewriteUrl(requestUrl) {
		if (
			['.js', '.css', '.svg', '.png'].some((ext) =>
				requestUrl.pathname.includes(ext),
			)
		) {
			return;
		}

		requestUrl.search = '_route_=' + requestUrl.pathname;
		requestUrl.pathname = 'index.php';

		return requestUrl;
	},
});
```

In `index.php` you can read `$_GET['_route_']` to decide what to render.

## Important: exclude static assets

Because the rewrite runs before Vite serves assets, you must return `undefined` for files such as JavaScript, CSS, images and fonts. Otherwise the plugin tries to send them through PHP.

## External redirects

Since version 2.0.4 you can redirect requests to an external origin:

```js
usePHP({
	rewriteUrl(requestUrl) {
		if (requestUrl.pathname.startsWith('/media/')) {
			return new URL(
				'https://cdn.example.com' +
					requestUrl.toString().substring(requestUrl.origin.length),
			);
		}
	},
});
```

When the rewritten URL points to a different origin, the plugin responds with a `307 Temporary Redirect`.

## Common use cases

- Pretty URLs: `/product/123` → `/index.php?_product=123`.
- API proxies: `/api/*` → `https://api.example.com/*`.
- Asset offloading: `/uploads/*` → external CDN.

See the [rewrite rules guide](../routing/rewrite-rules.md) for more patterns.
