# vite-plugin-php

[![npm](https://img.shields.io/npm/dt/vite-plugin-php?style=for-the-badge)](https://www.npmjs.com/package/vite-plugin-php) ![GitHub Repo stars](https://img.shields.io/github/stars/donnikitos/vite-plugin-php?label=GitHub%20Stars&style=for-the-badge) [![GitHub](https://img.shields.io/github/license/donnikitos/vite-plugin-php?color=blue&style=for-the-badge)](https://github.com/donnikitos/vite-plugin-php/blob/master/LICENSE)
![GitHub last commit](https://img.shields.io/github/last-commit/donnikitos/vite-plugin-php?style=for-the-badge) [![Issues](https://img.shields.io/github/issues/donnikitos/vite-plugin-php?style=for-the-badge)](https://github.com/donnikitos/vite-plugin-php/issues)

Precompile PHP-files with the speed of Vite!

```js
// vite.config.js
import { defineConfig } from 'vite';
import usePHP from 'vite-plugin-php';

export default defineConfig({
	plugins: [usePHP()],
});
```

## Write some PHP code in your `index.php`

```php
<!-- index.php -->
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	</head>
	<body>
		<?="Render some text with PHP!";?>

		<?php if(isset($_GET['dont_load'])) { ?>
			<script src="./src/some_script.js" type="module"></script>
		<?php } ?>
	</body>
</html>
```

The plugin will serve you the processed `index.php` as usual, including all imported and preprocessed files that are supported by Vite and other loaders.

## Configuration

By default the plugin is trying to access the system `php`-binary and load the `index.php` file as the main entry point.
However you have the possibility to use an other binary or even compile multiple entry-points:

```js
usePHP({
	binary: '/opt/lampp/bin/php-8.1.10',
	entry: ['index.php', 'about.php', 'contact.php'],
});
```

Should you have multiple entry-points, you will be able to access each one according to this chart:

| Entry       | Accessible routes         |
| ----------- | ------------------------- |
| index.php   | `/` `/index` `/index.php` |
| about.php   | `/about` `/about.php`     |
| contact.php | `/contact` `/contact.php` |
| ...         | ...                       |
