# Multi-entry site

Build a small site with multiple PHP pages, each sharing a layout and styles.

## File structure

```text
my-app/
├── index.php
├── about.php
├── contact.php
├── partials/
│   └── layout.php
├── assets/
│   ├── main.css
│   └── nav.js
└── vite.config.js
```

## vite.config.js

```js
import { defineConfig } from 'vite';
import usePHP from 'vite-plugin-php';

export default defineConfig({
	plugins: [
		usePHP({
			entry: [
				'index.php',
				'about.php',
				'contact.php',
				'partials/**/*.php',
			],
		}),
	],
});
```

Including `partials/**/*.php` lets Vite know about shared files, so changes to partials trigger a full reload.

## partials/layout.php

```php
<?php
$title ??= 'My Site'; ?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title><?= htmlspecialchars($title) ?></title>
		<link rel="stylesheet" href="./assets/main.css" />
	</head>
	<body>
		<nav>
			<a href="/">Home</a>
			<a href="/about">About</a>
			<a href="/contact">Contact</a>
		</nav>
		<main>
			<?php include $content; ?>
		</main>
		<script src="./assets/nav.js" type="module"></script>
	</body>
</html>
```

## index.php

```php
<?php
$title = 'Home';
$content = 'views/home.php';
include 'partials/layout.php';
```

## about.php

```php
<?php
$title = 'About Us';
$content = 'views/about.php';
include 'partials/layout.php';
```

## views/home.php

```php
<h1>Welcome home</h1>
<p>This page was rendered at <?= date('H:i:s') ?>.</p>
```

## views/about.php

```php
<h1>About us</h1>
<p>We use Vite and PHP together.</p>
```

## assets/main.css

```css
body {
	font-family: system-ui, sans-serif;
	padding: 2rem;
	line-height: 1.6;
}

nav a {
	margin-right: 1rem;
	text-decoration: none;
	color: #646cff;
}
```

## Build

```bash
npx vite build
```

The `dist/` folder will contain `index.php`, `about.php`, `contact.php`, hashed assets and the partials used at build time.
