<p align="center" style="text-align: center;">
	<img
	src="https://vite-php.nititech.de/assets/vite-php.logo.svg"
	alt="vite-plugin-php logo"
	style="width: 250px; max-width: 100%;" />
</p>

<div style="display: grid; grid-template-columns: max-content max-content; column-gap: 10px;">
	<a href="https://github.com/donnikitos/vite-plugin-php/blob/master/LICENSE" target="_blank"><img src="https://img.shields.io/github/license/donnikitos/vite-plugin-php?color=blue&style=for-the-badge" alt="License" /></a>
	<div></div>
	<a href="https://www.npmjs.com/package/vite-plugin-php" target="_blank"><img src="https://img.shields.io/npm/dt/vite-plugin-php?style=for-the-badge" alt="NPM" /></a>
	<a href="https://github.com/donnikitos/vite-plugin-php" target="_blank"><img src="https://img.shields.io/github/stars/donnikitos/vite-plugin-php?label=GitHub%20Stars&style=for-the-badge" alt="GitHub Stars" /></a>
	<a href="https://github.com/donnikitos/vite-plugin-php/issues" target="_blank"><img src="https://img.shields.io/github/issues/donnikitos/vite-plugin-php?style=for-the-badge" alt="Issues" /></a>
	<img src="https://img.shields.io/github/last-commit/donnikitos/vite-plugin-php?style=for-the-badge" alt="Last Commit" />
</div>

\
Use Vite's speed and tooling to work with PHP!

```js
// vite.config.js
import { defineConfig } from 'vite';
import usePHP from 'vite-plugin-php';

export default defineConfig({
	plugins: [usePHP()],
});
```

<p align="center" style="text-align: center;">
	<b>
		<a href="https://www.npmjs.com/package/vite-plugin-php">NPM</a> | <a href="https://vite-php.nititech.de/">Wiki</a> | <a href="https://github.com/donnikitos/vite-plugin-php/discussions">Discussions</a> | <a href="https://github.com/nititech/php-vite-starter">Starter-Repo</a>
	</b>
</p>

## ⚡ Latest changes

##### Major Release 2.0.0 !!!

Including full _PHP error logging_ into console, rewritten code for _better performance_, bug fixes, etc.\
[See changelog](https://vite-php.nititech.de/changelog).

##### Releases >= 1.0.0

| Version | Feature                                                          |
| ------- | ---------------------------------------------------------------- |
| 1.0.71  | Fixed assets prepending for namespaced PHP-files                 |
| 1.0.70  | Added include path override for relative PHP imports in dev mode |
| 1.0.69  | Using new token format to escape PHP in HTML                     |
| 1.0.68  | Improved transpiled code evaluation (removed native `eval()`)    |
| ...     | ...                                                              |

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
		<div id="root">
			<?="Render some text with PHP!"; ?>
		</div>

		<?php if(isset($_GET['show_hello'])): ?>
			Hello world!
		<?php endif; ?>

		<script src="./src/react-app.tsx" type="module"></script>
	</body>
</html>
```

The plugin will serve you the processed `index.php` as usual, including all imported and preprocessed files that are supported by Vite and other loaders.

## Configuration

The configuration takes following properties:

```ts
type UsePHPConfig = {
	binary?: string;
	// Override default PHP server host address. Default is `localhost`.
	php?: { host?: string };
	entry?: string | string[];
	rewriteUrl?: (requestUrl: URL) => URL | undefined;
	tempDir?: string;
	dev?: {
		// Takes on either a bitmask, or named constants EPHPError
		errorLevels?: number;
		cleanup?: boolean;
	};
};

// Detailed description on https://www.php.net/manual/en/errorfunc.constants.php
const EPHPError = {
	ERROR: 1,
	WARNING: 2,
	PARSE: 4,
	NOTICE: 8,
	CORE_ERROR: 16,
	CORE_WARNING: 32,
	COMPILE_ERROR: 64,
	COMPILE_WARNING: 128,
	USER_ERROR: 256,
	USER_WARNING: 512,
	USER_NOTICE: 1024,
	STRICT: 2048,
	RECOVERABLE_ERROR: 4096,
	DEPRECATED: 8192,
	USER_DEPRECATED: 16384,
	ALL: 32767,
};
```

By default the plugin is trying to access the system `php`-binary and load the `index.php` file as the main entry point.

#### Alternative entry points

However you have the possibility to use an other binary or even compile multiple entry-points:

```js
usePHP({
	binary: '/opt/lampp/bin/php-8.1.10',
	entry: ['index.php', 'index_alt.php', 'pages/contact.php'],
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

You can also specify wildcard entry points:

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

#### Rewrite urls

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

Since version 2.0.4 it is possible to point to some external files. Make sure the change URL points to an external origin:

```js
usePHP({
	rewriteUrl(requestUrl) {
		if (requestUrl.pathname.startsWith('/media/')) {
			return new URL(
				'https://nititech.de' +
					requestUrl.toString().substring(requestUrl.origin.length),
			);
		}
	},
});
```

⚠️ **Attention:** If using the rewriteUrl property you will need to exclude (_return undefined_) assets like CSS, JavaScript, Images, etc.., that match your transpiled php file names, on your own!

#### Error logging

Just like in native PHP you can specify what errors you want to see:

```js
// vite.config.js
import { defineConfig } from 'vite';
import usePHP, { EPHPError } from 'vite-plugin-php';

export default defineConfig({
	plugins: [
		usePHP({
			dev: {
				errorLevels:
					EPHPError.ERROR | EPHPError.WARNING | EPHPError.STRICT,
			},
		}),
	],
});
```

This log will be printed into your console, just like any other message about what is happening in Vite.\
For more details about the meaning of the error level constants, visit the original [PHP-documentation](https://www.php.net/manual/en/errorfunc.constants.php).

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
<script src="./src/<?='dynamic_script_name'; ?>.js" type="module"></script>
```

#### Conditional script and style loading

The plugin won't be able to retain the position of some asset tags like `<script>` and `<link>`.

```php
<?php if($some_condition$) { ?>
	<script src="./src/some_script.js" type="module"></script>
<?php } ?>
```

Vite processes these independently and merges/ splits them dynamically.\
These will be attached to the `<head>` tag or put right in the beginning of the file.

If the file contains a PHP **namespace** the assets will be either\
a) placed after the last closed tag\
b) placed right before the last `<?` tag\
c) placed at the end of the file

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
