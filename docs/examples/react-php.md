# React + PHP

Render a React application inside a PHP page. PHP handles the initial request, then React takes over in the browser.

## File structure

```text
my-app/
├── index.php
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   └── style.css
├── package.json
└── vite.config.ts
```

## Install dependencies

```bash
npm install react react-dom
npm install --save-dev @vitejs/plugin-react
```

## vite.config.ts

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import usePHP from 'vite-plugin-php';

export default defineConfig({
	plugins: [usePHP(), react()],
});
```

## index.php

```php
<!-- index.php -->
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>React + PHP</title>
		<link rel="stylesheet" href="./src/style.css" />
	</head>
	<body>
		<div id="root"></div>
		<script src="./src/main.tsx" type="module"></script>
	</body>
</html>
```

## src/main.tsx

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
```

## src/App.tsx

```tsx
function App() {
	return (
		<div className="app">
			<h1>Hello from React</h1>
			<p>This page was served by PHP and hydrated by React.</p>
		</div>
	);
}

export default App;
```

## Passing data from PHP to React

You can embed initial data as a global variable:

```php
<?php $user = json_encode(['name' => 'Alice', 'id' => 42]); ?>
<script>window.__INITIAL_DATA__ = <?php echo $user; ?>;</script>
```

Then read it in `App.tsx`:

```tsx
const user = (window as any).__INITIAL_DATA__;
```

## Run it

```bash
npx vite
```

React Fast Refresh works normally because the React plugin processes the TypeScript modules through Vite, while PHP handles the page shell.
