# Vite Pipeline

Starting with version 3.0.0, the plugin fully participates in the Vite plugin pipeline. This means your PHP files are loaded, transformed and emitted through the same hooks as HTML and other assets, so other Vite plugins can run before and after PHP processing.
Before 3.0.0 the plugin processed PHP in isolation. In 3.0.0 the plugin registers a set of internal plugins that each hook into a different Vite phase.

## How does it work?

Vite's HTML transforms do not understand `<?php ... ?>` tags. If the plugin did not escape them, Vite might treat PHP code as HTML text, strip it or move it around.
The plugin temporarily replaces each PHP fragment with a unique token, lets Vite do its work, then restores the original code using a stored mapping.

## Where your plugins fit in

You can place your own Vite plugins in three useful spots:

1. **Before `usePHP()` with `transformIndexHtml.order: 'pre'`** — inject or modify PHP before the plugin escapes it.
2. **After `usePHP()` with plain `transformIndexHtml`** — modify HTML after Vite transforms but before PHP is restored.
3. **After `usePHP()` with `transformIndexHtml.order: 'post'`** — modify the final HTML after PHP is restored.

See the next pages for examples of each.

## Guides

- [Before PHP transform](./before-transform.md)
- [After PHP transform](./after-transform.md)
- [Plugin examples](./plugin-examples.md)
