# Routing

The plugin builds a route for every entry file. This page explains how entry files map to dev URLs and production build outputs.

## Entry-to-route table

| Entry file            | Accessible routes                         | Build output               |
| --------------------- | ----------------------------------------- | -------------------------- |
| `index.php`           | `/` `/index` `/index.php`                 | `dist/index.php`           |
| `about.php`           | `/about` `/about.php`                     | `dist/about.php`           |
| `about/details.php`   | `/about/details` `/about/details.php`     | `dist/about/details.php`   |
| `contact.php`         | `/contact` `/contact.php`                 | `dist/contact.php`         |
| `shop/index.php`      | `/shop/` `/shop/index.php`                | `dist/shop/index.php`      |
| `pages/blog/post.php` | `/pages/blog/post` `/pages/blog/post.php` | `dist/pages/blog/post.php` |

## Trailing slashes

A trailing slash is automatically mapped to `index.php` inside that folder. For example, `/shop/` resolves to `shop/index.php`.

## Route priority

The plugin matches the request path against the entry list. More specific paths win because the list is searched in the order Vite resolves the globs.

## URL rewriting

For more advanced routing, use the [`rewriteUrl`](../configuration/rewriteUrl.md) option. You can simulate Apache `mod_rewrite` rules such as:

- `/product/123` → `/index.php?product=123`
- `/blog/some-title` → `/index.php?page=blog&slug=some-title`

See the [rewrite rules guide](./rewrite-rules.md) for copy-paste patterns.

## Production

During `vite build` the plugin emits each entry as a `.php` file in `dist/`, preserving the folder structure. You can deploy `dist/` to a host that supports PHP, or configure your web server to proxy `.php` requests to PHP-FPM or mod_php.
