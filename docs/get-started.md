# Get started

### Installation

First, install vite-plugin-php using npm:

```bash
npm install vite-plugin-php@latest --save-dev
```

### Adjust Vite

To configure Vite to use vite-plugin-php, update your `vite.config.js` file as follows:

```javascript
import { defineConfig } from 'vite';
import usePHP from 'vite-plugin-php';

export default defineConfig({
  plugins: [usePHP()],
});
```

ℹ️ By default, the plugin attempts to access the system's php binary and uses `index.php` as the main entry point.\
You can alos customize the PHP binary path or specify multiple entry points:

```
usePHP({
  binary: '/path/to/php', // Specify your PHP binary path
  entry: ['index.php', 'about.php', 'contact.php'], // Multiple entry points
});
```

### Use PHP

Instead of the `index.html` create an `index.php` file in your project root:

```php
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite PHP Integration</title>
  </head>
  <body>
    <?php echo "Hello, Vite and PHP!"; ?>

    <?php if (isset($_GET['show_me'])): ?>
      Hello world!
    <?php endif; ?>
  </body>
</html>
```

With this setup, `vite-plugin-php` processes your `index.php` file, including all imported and preprocessed assets supported by Vite and other loaders.
