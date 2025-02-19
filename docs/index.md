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
