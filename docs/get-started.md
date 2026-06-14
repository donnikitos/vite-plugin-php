# Get started

This guide walks you through creating your first PHP project powered by Vite.

## What you need

- A working [Node.js](https://nodejs.org/) installation.
- A PHP binary available on your system path. Run `php -v` in your terminal to verify.

## Step 1: Create a project

Create a folder for your project and install Vite plus the plugin:

```bash
mkdir my-php-app
cd my-php-app
npm install vite vite-plugin-php@latest --save-dev
```

## Step 2: Configure Vite

Create a `vite.config.ts` file in the project root:

```js
// vite.config.ts
import { defineConfig } from 'vite';
import usePHP from 'vite-plugin-php';

export default defineConfig({
	plugins: [usePHP()],
});
```

By default the plugin looks for a system `php` binary and uses `index.php` as the only entry point.

## Step 3: Create your PHP entry

Delete `index.html` if it exists and create `index.php` instead:

```php
<!-- index.php -->
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>My PHP App</title>
		<link rel="stylesheet" href="./src/style.css" />
	</head>

	<body>
		<h1><?= 'Hello from PHP!' ?></h1>

		<?php if (isset($_GET['visitor'])): ?>
			<p>Welcome back, <?= htmlspecialchars($_GET['visitor']) ?>!</p>
		<?php endif; ?>

		<script src="./src/main.js" type="module"></script>
	</body>
</html>
```

## Step 4: Add assets

Create a `src` folder with a script and a stylesheet:

```js
// src/main.js
import './style.css';

console.log('Vite + PHP are working!');
```

```css
/* src/style.css */
body {
	font-family: system-ui, sans-serif;
	padding: 2rem;
}
```

## Step 5: Run the dev server

```bash
npx vite
```

Open the URL shown in your terminal, for example `http://localhost:5173`. You should see your rendered PHP page. Try adding `?visitor=Alice` to the URL to see the conditional PHP block in action.

## Step 6: Build for production

```bash
npx vite build
```

The `dist/` folder will contain:

- `index.php` with the processed PHP source.
- Hashed JavaScript and CSS assets.
- Any other imported assets.

You can now deploy the `dist/` folder to any static or PHP host.

## Common next steps

- [Configure the plugin](./configuration/)
- [Add more entry points](./configuration/entry.md)
- [Set up URL rewrites](./routing/rewrite-rules.md)
- [Use environment variables](./examples/env-variables.md)
- [Combine with other Vite plugins](./vite-pipeline/)
