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
Use Vite's speed, ecosystem and tooling to build with PHP.

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
    <a href="https://www.npmjs.com/package/vite-plugin-php">NPM</a> | <a href="https://vite-php.nititech.de/">Wiki</a> | <a href="https://github.com/donnikitos/vite-plugin-php/discussions">Discussions</a> | <a href="https://github.com/nititech/modern-php-vite-starter">Starter-Repo</a>
  </b>
</p>

## ⚡ Latest changes

##### Major Release 3.0.0 !!!

Plugin now fully utilizes the Vite pipeline to load, transform and HTML-transform files in proper order.\
⚠️ This might result in breaking changes since code can now be affected by other plugins!

[See changelog](https://vite-php.nititech.de/changelog).

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
      <?= 'Render some text with PHP!' ?>
    </div>

    <?php if (isset($_GET['show_hello'])): ?>
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
		// Takes on either a bitmask, or named constants EPHPError.
		// Default is EPHPError.ALL | EPHPError.STRICT.
		errorLevels?: number;
		// Cleanup temporary files on shutdown. Default is `true`.
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

By default the plugin tries to access the system `php` binary, load `index.php` as the main entry point and writes temporary PHP files to `.php-tmp`.

#### Alternative entry points

However you have the possibility to use an other binary or even compile multiple entry-points:

```js
usePHP({
	binary: '/opt/lampp/bin/php-8.1.10',
	entry: ['index.php', 'index_alt.php', 'pages/contact.php'],
});
```

Should you have multiple entry-points, you will be able to access each one according to this chart:

| Entry file            | Accessible routes                         | Build output               |
| --------------------- | ----------------------------------------- | -------------------------- |
| `index.php`           | `/` `/index` `/index.php`                 | `dist/index.php`           |
| `about.php`           | `/about` `/about.php`                     | `dist/about.php`           |
| `about/details.php`   | `/about/details` `/about/details.php`     | `dist/about/details.php`   |
| `contact.php`         | `/contact` `/contact.php`                 | `dist/contact.php`         |
| `shop/index.php`      | `/shop/` `/shop/index.php`                | `dist/shop/index.php`      |
| `pages/blog/post.php` | `/pages/blog/post` `/pages/blog/post.php` | `dist/pages/blog/post.php` |
| ...                   | ...                                       | ...                        |

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

If you are using some sort of Apache _mod_rewrite_ magic or nginx rewrite rules you can simulate them with the `rewriteUrl` property.
The `rewriteUrl` function has one parameter — the requested URL given as a `URL` object — and returns either a modified `URL` object or `undefined`:

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

⚠️ **Attention:** If you use `rewriteUrl` you must exclude static assets like CSS, JavaScript, images and fonts by returning `undefined`, otherwise the plugin tries to send them through PHP.

Since version 2.0.4 it is possible to point to an external origin. Make sure the changed URL points to a different origin:

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

When the rewritten URL points to a different origin, the plugin responds with a `307 Temporary Redirect`.

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

#### Altering transformation results

With additional Vite-plugins you can now alter the outcome of the [`transformIndexHtml()`](https://vite.dev/guide/api-plugin.html#transformindexhtml) pipeline.\
You can either apply modifications

#### `before` PHP and Vite transforms

```ts
// vite.config.ts
...,
plugins: [
   {
      name: 'pre-transform',
      transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
         return html.replace(
            '</body>',
            '<div><?= "Pre PHP transform"; ?></div></body>',
            );
         },
      },
   },
   usePHP(),
],
...
```

This adds a hook to run between loading the PHP code and unescaping PHP fragments, prior to passing everything further to Vite's own HTML transformation magic.

#### `after` PHP and Vite transforms

```ts
// vite.config.ts
...,
plugins: [
   usePHP(),
   {
      name: 'post-transform',
      transformIndexHtml(html, ctx) {
        return html.replace(
          '</body>',
          '<div><?= "Post PHP transform"; ?></div></body>',
        );
      },
   },
],
...
```

or

```ts
// vite.config.ts
...,
plugins: [
   usePHP(),
   {
      name: 'post-transform',
      transformIndexHtml: {
         order: 'post',
         handler(html, ctx) {
            return html.replace(
               '</body>',
               '<div><?= "Post PHP transform"; ?></div></body>',
            );
         },
      },
   },
],
...
```

This hook runs right after Vite's transformations and unescaping PHP fragments.

#### Altering transformation results

With additional Vite plugins you can alter the outcome of the [`transformIndexHtml()`](https://vite.dev/guide/api-plugin.html#transformindexhtml) pipeline.\
The plugin temporarily replaces each PHP fragment with a unique token, lets Vite do its work, then restores the original code.

You can place your own Vite plugins in three useful spots:

1. **Before `usePHP()` with `transformIndexHtml.order: 'pre'`** — inject or modify PHP before the plugin escapes it.
2. **After `usePHP()` with plain `transformIndexHtml`** — modify HTML after Vite transforms but before PHP is restored.
3. **After `usePHP()` with `transformIndexHtml.order: 'post'`** — modify the final HTML after PHP is restored.

#### `before` PHP and Vite transforms

```ts
// vite.config.ts
...,
plugins: [
   {
      name: 'pre-transform',
      transformIndexHtml: {
         order: 'pre',
         handler(html, ctx) {
            return html.replace(
               '</body>',
               '<div><?= "Pre PHP transform"; ?></div></body>',
            );
         },
      },
   },
   usePHP(),
],
...
```

This hook runs between loading the PHP code and unescaping PHP fragments, before Vite's own HTML transformations.

#### `after` PHP and Vite transforms

```ts
// vite.config.ts
...,
plugins: [
   usePHP(),
   {
      name: 'post-transform',
      transformIndexHtml: {
         order: 'post',
         handler(html, ctx) {
            return html.replace(
               '</body>',
               '<div><?= "Post PHP transform"; ?></div></body>',
            );
         },
      },
   },
],
...
```

This hook runs right after Vite's transformations and unescaping PHP fragments.

## Limitations

vite-plugin-php makes PHP and Vite work together, but there are a few patterns that need special care or do not work the way you might expect.

#### Inline modules

PHP variables are not available inside inline `<script type="module">` blocks.

```php
<?php $var = 'foo'; ?>

<script type="module">
   console.log('<?= $var ?>');
</script>
```

Vite transpiles inline modules into separate files, so they are no longer part of the same PHP execution. Server variables such as `$_GET` and `$_POST` will also have different values there.

**Workaround:** assign the value to a regular script block or a data attribute before the module:

```php
<script>
   window.__VAR__ = '<?= $var ?>';
</script>
<script type="module" src="./src/main.js"></script>
```

#### Dynamic asset paths

Vite cannot process asset paths that are computed by PHP:

```php
<!-- This will not be bundled -->
<script src="./src/<?= $script ?>.js" type="module"></script>
```

Vite needs a literal path at build time. If the set of possible files is known, import them statically and choose at runtime.

#### Conditional script and style tags

If you wrap `<script>` or `<link>` tags in PHP conditionals, Vite might move them to another place.

```php
<?php if ($some_condition): ?>
   <script src="./src/some_script.js" type="module"></script>
<?php endif; ?>
```

Vite processes these tags independently and merges or splits them. The resulting tags are typically appended to `<head>` or placed at the start of the document.

A possible workaround is to define those modules in separate PHP files and include them conditionally.

#### PHP namespaces

When the file contains a PHP namespace declaration, the plugin tries to place recovered assets:

1. after the last closed HTML tag, or
2. right before the last `<?` tag, or
3. at the end of the file.

If your layout depends on exact tag placement, prefer keeping assets outside of namespaced blocks.

#### External redirects

The `rewriteUrl` option can redirect to external origins, but it runs before Vite handles assets. You must explicitly return `undefined` for static assets to avoid sending them through PHP.

#### Build-time environment variables

Environmental `%ENV%` placeholders are replaced during both dev and build.
Be careful not to expose secrets because the replaced values are written into `dist/`.

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
