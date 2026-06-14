# PHP Server

Vite itself does not run PHP, so the plugin spawns during development a PHP sub-process and proxies page requests to it.
This page explains how that server is used and how it fits around Vite.

## What the plugin does

1. When the Vite dev server starts, the plugin picks a free port and spawns a PHP process with a custom router.
2. Page requests are rewritten, matched against entries and forwarded to the PHP server.
3. PHP executes the prepared temporary file and returns HTML.
4. The plugin injects the Vite client script and returns the response to the browser.

## Port selection

The plugin starts at port `6535` and increments until it finds a free port.
This allows multiple projects to run in parallel.

## Lifecycle

- The PHP server is started once per Vite dev session.
- When Vite restarts, the plugin unregisters and re-registers cleanup hooks.
- When Vite shuts down, the PHP process is killed and temporary files are removed unless `dev.cleanup` is set to `false`.

## Error reporting

PHP errors are captured and forwarded to the Vite console.
You can control which errors appear with the [`dev.errorLevels`](../configuration/dev.md) option.

## Production builds

The PHP server is **not** used during `vite build`.
Instead, entries are processed through Vite's build pipeline and written to the output directory.
