# Limitations

vite-plugin-php makes PHP and Vite work together, but there are a few patterns that need special care or do not work the way you might expect.

## Inline modules

PHP variables are not available inside inline `<script type="module">` blocks.

```php
<?php $var = 'foo'; ?>

<script type="module">
	console.log('<?= $var ?>'); // undefined!</script>
```

Vite transpiles inline modules into separate files, so they are no longer part of the same PHP execution. Server variables such as `$_GET` and `$_POST` will also have different values there.

### Workaround

Assign the value to a regular script block or a data attribute before the module:

```php
<script>
	window.__VAR__ = '<?= $var ?>';
</script>
<script type="module" src="./src/main.js"></script>
```

## Dynamic asset paths

Vite cannot process asset paths that are computed by PHP:

```php
<!-- This will not be bundled -->
<script src="./src/<?= $script ?>.js" type="module"></script>
```

Vite needs a literal path at build time. If the set of possible files is known, import them statically and choose at runtime.

## Conditional script and style tags

If you wrap `<script>` or `<link>` tags in PHP conditionals, Vite might move them to another place.

```php
<?php if ($some_condition) { ?>
	<script src="./src/some_script.js" type="module"></script>
<?php } ?>
```

Vite processes these tags independently and merges or splits them. The resulting tags are typically appended to `<head>` or placed at the start of the document.

ℹ️ A possible workaround is to define those modules in separate php files and include them conditionally.

### PHP namespaces

When the file contains a PHP namespace declaration, the plugin tries to place recovered assets:

1. after the last closed HTML tag, or
2. right before the last `<?` tag, or
3. at the end of the file.

If your layout depends on exact tag placement, prefer keeping assets outside of namespaced blocks.

## External redirects

The `rewriteUrl` option can redirect to external origins, but it runs before Vite handles assets. You must explicitly return `undefined` for static assets to avoid sending them through PHP.

## Build-time environment variables

Environmental `%ENV%` placeholders are replaced during both dev and build.
Be careful not to expose secrets because the replaced values are written into `dist/`.

## Getting help

If you run into behavior that is not covered here, open a [GitHub issue](https://github.com/donnikitos/vite-plugin-php/issues) or start a [discussion](https://github.com/donnikitos/vite-plugin-php/discussions).
