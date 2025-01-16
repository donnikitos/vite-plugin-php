# vite-plugin-php

[![npm](https://img.shields.io/npm/dt/vite-plugin-php?style=for-the-badge)](https://www.npmjs.com/package/vite-plugin-php) [![GitHub Repo stars](https://img.shields.io/github/stars/donnikitos/vite-plugin-php?label=GitHub%20Stars&style=for-the-badge)](https://github.com/donnikitos/vite-plugin-php) [![GitHub](https://img.shields.io/github/license/donnikitos/vite-plugin-php?color=blue&style=for-the-badge)](https://github.com/donnikitos/vite-plugin-php/blob/master/LICENSE)
![GitHub last commit](https://img.shields.io/github/last-commit/donnikitos/vite-plugin-php?style=for-the-badge) [![Issues](https://img.shields.io/github/issues/donnikitos/vite-plugin-php?style=for-the-badge)](https://github.com/donnikitos/vite-plugin-php/issues)

Use Vite's speed and tooling to process PHP-files!

```js
// vite.config.js
import { defineConfig } from 'vite';
import usePHP from 'vite-plugin-php';

export default defineConfig({
	plugins: [usePHP()],
});
```

Check out the [starter repo](https://github.com/nititech/php-vite-starter) for an easy and convenient start:
<a href="https://github.com/nititech/php-vite-starter" target="_blank"><img src="https://nititech.de/kosmo-starter-button.png" alt="Starter Repo"></a>

## ⚡ Latest changes

| Version | Feature                                                                                                     |
| ------- | ----------------------------------------------------------------------------------------------------------- |
| 1.0.68  | Improved transpiled code evaluation (removed native `eval()`)                                               |
| 1.0.67  | Removed whitespaces from PHP responses in dev mode                                                          |
| 1.0.66  | Fixed file monitoring on Windows                                                                            |
| 1.0.65  | Fixed request body forwarding for all request methods                                                       |
| 1.0.62  | HTML transforms are now only applied to HTML contents during dev                                            |
| 1.0.60  | Fixed inline module transpiling -> PHP code is being properly inserted into transpiled inline module chunks |
| 1.0.55  | Fixed pure PHP file processing                                                                              |
| 1.0.50  | Using native Rollup pipeline to generate bundle -> proper error messages during build                       |
| ...     | ...                                                                                                         |

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

The configuration takes following properties:

```ts
type UsePHPConfig = {
	binary?: string;
	entry?: string | string[];
	rewriteUrl?: (requestUrl: URL) => URL | undefined;
	tempDir?: string;
	cleanup?: {
		dev?: boolean;
		build?: boolean;
	};
};
```

By default the plugin is trying to access the system `php`-binary and load the `index.php` file as the main entry point.
However you have the possibility to use an other binary or even compile multiple entry-points:

```js
usePHP({
	binary: '/opt/lampp/bin/php-8.1.10',
	entry: ['index.php', 'about.php', 'contact.php'],
});
```

Should you have multiple entry-points, you will be able to access each one according to this chart:

| Entry file        | Accessible routes                     | Build file          |
| ----------------- | ------------------------------------- | ------------------- |
| index.php         | `/` `/index` `/index.php`             | `index.php`         |
| about.php         | `/about` `/about.php`                 | `about.php`         |
| about/details.php | `/about/details` `/about/details.php` | `about/details.php` |
| contact.php       | `/contact` `/contact.php`             | `contact.php`       |
| shop/index.php    | `/shop/` `/shop/index.php`            | `shop/index.php`    |
| ...               | ...                                   | ...                 |

Since version 1.0.6 you can specify wildcard entry points:

```js
usePHP({
	binary: '/opt/lampp/bin/php-8.1.10',
	entry: [
		'index.php',
		'about.php',
		'contact.php',
		'pages/**/*.php',
		'partials/*.php',
	],
});
```

These entries will also render according to the routing table above.

##### Rewrite urls

If you are using some sort of Apaches _mod_rewrite_ magic or nginx rewrite rules you can simulate them with the newly added in `rewriteUrl` property.
The rewriteUrl function has one parameter - the requested URL given as URL object - and return either a modified URL object or undefined:

```js
usePHP({
	entry: ['index.php', 'partials/**/*.php'],
	rewriteUrl(requestUrl) {
		if (['.js', '.css'].some((s) => requestUrl.pathname.includes(s))) {
			return;
		}

		requestUrl.search = '_request_=' + requestUrl.pathname;
		requestUrl.pathname = 'index.php';

		return requestUrl;
	},
});
```

⚠️ **Attention:** If using the rewriteUrl property you will need to exclude (_return undefined_) assets like CSS, JavaScript, Images, etc.., that match your transpiled php file names, on your own!

## Specific oddities

#### Inline modules

⚠️ PHP will work somehow unintuitive in inlined modules.
E.g. you have a page with some variables:

```php
<?php
$var = 'foo';
?>

<script type="module">
	console.log('<?=$var; ?>');
</script>
```

This will not work. `$var` will be undefined in the module since the script is being transpiled into a separate file and included separately.
Same applies to other server variables like `$_GET`, `$_POST` and so on - they will not have the same value as the main PHP file.

#### Dynamically included asset processing

Vite won't be able to process PHP-computed styles, scripts or images:

```php
<script src="./src/<?='dynamic_script_name';?>.js" type="module"></script>
```

## Issues

If you encounter any other bugs or need some other features feel free to open an [issue](https://github.com/donnikitos/vite-plugin-php/issues).

## Support

Love open source? Enjoying my project?\
Your support can keep the momentum going! Consider a donation to fuel the creation of more innovative open source software.

<table>
	<tr>
		<td>
			via Ko-Fi
		</td>
		<td>
			Buy me a coffee
		</td>
		<td>
			via PayPal
		</td>
	</tr>
	<tr>
		<td>
			<a href="https://ko-fi.com/Y8Y2ALMG" target="_blank"><img src="https://ko-fi.com/img/githubbutton_sm.svg" alt="Ko-Fi" width="174"></a>
		</td>
		<td>
			<a href="https://www.buymeacoffee.com/donnikitos" target="_blank"><img src="https://nititech.de/donate-buymeacoffee.png" alt="Buy Me A Coffee" width="174"></a>
		</td>
		<td>
			<a href="https://www.paypal.com/donate/?hosted_button_id=EPXZPRTR7JHDW" target="_blank"><img src="https://nititech.de/donate-paypal.png" alt="PayPal" width="174"></a>
		</td>
	</tr>
</table>
