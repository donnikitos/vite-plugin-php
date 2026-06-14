# Basic PHP page

The simplest possible setup: one `index.php` entry and one JavaScript module.

## File structure

```text
my-app/
├── index.php
├── src/
│   ├── main.js
│   └── style.css
└── vite.config.js
```

## vite.config.js

```js
import { defineConfig } from 'vite';
import usePHP from 'vite-plugin-php';

export default defineConfig({
	plugins: [usePHP()],
});
```

## index.php

```php
<!-- index.php -->
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Basic PHP Page</title>
		<link rel="stylesheet" href="./src/style.css" />
	</head>
	<body>
		<h1><?php echo 'Rendered by PHP at ' . date('H:i:s'); ?></h1>
		<script src="./src/main.js" type="module"></script>
	</body>
</html>
```

## src/style.css

```css
body {
	font-family: system-ui, sans-serif;
	padding: 2rem;
	background: #f8fafc;
	color: #1e293b;
}
```

## src/main.js

```js
console.log('Hello from Vite and PHP!');
```

## Run it

```bash
npx vite
```

Open `http://localhost:5173`. The heading shows the current server time, proving PHP executed before the page was served.
