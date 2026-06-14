# Rewrite rules

This guide translates common Apache and nginx rewrite patterns into [`rewriteUrl`](../configuration/rewriteUrl.md) configurations.

## Front controller pattern

Everything except real files goes to `index.php`.

### Apache equivalent

```apache
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.php [QSA,L]
```

### Plugin equivalent

```js
usePHP({
	entry: 'index.php',
	rewriteUrl(requestUrl) {
		if (requestUrl.pathname.includes('.')) {
			return;
		}

		requestUrl.searchParams.set('route', requestUrl.pathname);
		requestUrl.pathname = 'index.php';

		return requestUrl;
	},
});
```

In `index.php`:

```php
<?php
$route = $_GET['route'] ?? '/';

switch ($route) {
	case '/':
		include 'views/home.php';
		break;
	case '/about':
		include 'views/about.php';
		break;
	default:
		http_response_code(404);
		include 'views/404.php';
}
```

## Product details page

Turn `/product/123` into `/product.php?id=123`.

```js
usePHP({
	entry: ['index.php', 'product.php'],
	rewriteUrl(requestUrl) {
		const match = requestUrl.pathname.match(/^\/product\/(\d+)$/);

		if (match) {
			requestUrl.searchParams.set('id', match[1]);
			requestUrl.pathname = 'product.php';
			return requestUrl;
		}
	},
});
```

## Blog slug

Turn `/blog/my-post-title` into `/blog.php?slug=my-post-title`.

```js
usePHP({
	entry: ['index.php', 'blog.php'],
	rewriteUrl(requestUrl) {
		const match = requestUrl.pathname.match(/^\/blog\/([a-z0-9-]+)$/);

		if (match) {
			requestUrl.searchParams.set('slug', match[1]);
			requestUrl.pathname = 'blog.php';
			return requestUrl;
		}
	},
});
```

## API proxy

Forward `/api/*` calls to an external backend during development.

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

`/api/users` becomes `https://api.example.com/users`.

## CDN assets

Offload `/uploads/*` to a CDN.

```js
usePHP({
	rewriteUrl(requestUrl) {
		if (requestUrl.pathname.startsWith('/uploads/')) {
			return new URL(
				'https://cdn.example.com' +
					requestUrl.toString().substring(requestUrl.origin.length),
			);
		}
	},
});
```

## Remember to exclude static files

The rewrite happens before Vite handles assets. Always return `undefined` for JavaScript, CSS, images, fonts and Vite internal paths like `/@vite/client`.
