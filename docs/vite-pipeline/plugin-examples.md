# Plugin examples

Because vite-plugin-php participates in the normal Vite pipeline, many existing plugins work alongside it. This page shows common pairings.

## Tailwind CSS

Use Tailwind's Vite plugin to process styles imported from PHP entries.

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import usePHP from 'vite-plugin-php';

export default defineConfig({
	plugins: [usePHP(), tailwindcss()],
});
```

```php
<!-- index.php -->
<!DOCTYPE html>
<html lang="en">
	<head>
		<link rel="stylesheet" href="./src/style.css" />
	</head>
	<body>
		<h1 class="text-3xl font-bold text-blue-600">PHP + Tailwind</h1>
	</body>
</html>
```

```css
/* src/style.css */
@import 'tailwindcss';
```

## UnoCSS

```ts
import { defineConfig } from 'vite';
import UnoCSS from 'unocss/vite';
import usePHP from 'vite-plugin-php';

export default defineConfig({
	plugins: [usePHP(), UnoCSS()],
});
```

## React

Mount a React app inside a PHP page. See the [React + PHP example](../examples/react-php.md) for a complete walkthrough.

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import usePHP from 'vite-plugin-php';

export default defineConfig({
	plugins: [usePHP(), react()],
});
```

## Vue

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import usePHP from 'vite-plugin-php';

export default defineConfig({
	plugins: [usePHP(), vue()],
});
```

## MDX

If you want to author content in MDX and include it from PHP, add the MDX plugin:

```ts
import { defineConfig } from 'vite';
import mdx from '@mdx-js/rollup';
import usePHP from 'vite-plugin-php';

export default defineConfig({
	plugins: [
		usePHP(),
		{
			...mdx(),
			enforce: 'pre',
		},
	],
});
```

## Vite legacy plugin

```ts
import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import usePHP from 'vite-plugin-php';

export default defineConfig({
	plugins: [usePHP(), legacy()],
});
```

## Ordering matters

As a rule of thumb:

- Plugins that produce HTML before PHP runs should generally be registered **before** `usePHP()` with `enforce: 'pre'` or `transformIndexHtml.order: 'pre'`.
- Plugins that consume the final HTML output should be registered **after** `usePHP()`.

If an output looks wrong, try swapping the order of `usePHP()` and the other plugin and check whether `enforce: 'pre'` or `enforce: 'post'` is needed.
