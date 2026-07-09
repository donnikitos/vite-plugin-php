<div class="text-center px-4 pt-12 pb-8">
	<h1 class="text-4xl font-extrabold mb-2 leading-tight">vite-plugin-php</h1>
	<p class="text-xl mb-6 opacity-85">
		Use Vite's speed, HMR and ecosystem to build with PHP.
	</p>
	<div class="flex flex-wrap justify-center gap-2 mb-8">
		<a href="https://github.com/donnikitos/vite-plugin-php/blob/master/LICENSE" target="_blank">
			<img class="h-6" src="https://img.shields.io/github/license/donnikitos/vite-plugin-php?color=blue&style=for-the-badge" alt="License" />
		</a>
		<a href="https://www.npmjs.com/package/vite-plugin-php" target="_blank">
			<img class="h-6" src="https://img.shields.io/npm/dt/vite-plugin-php?style=for-the-badge" alt="NPM" />
		</a>
		<a href="https://github.com/donnikitos/vite-plugin-php" target="_blank">
			<img class="h-6" src="https://img.shields.io/github/stars/donnikitos/vite-plugin-php?label=GitHub%20Stars&style=for-the-badge" alt="GitHub Stars" />
		</a>
		<a href="https://github.com/donnikitos/vite-plugin-php/issues" target="_blank">
			<img class="h-6" src="https://img.shields.io/github/issues/donnikitos/vite-plugin-php?style=for-the-badge" alt="Issues" />
		</a>
	</div>
	<div class="flex flex-wrap justify-center gap-3 mb-8">
		<a class="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg bg-indigo-500 text-white!" href="./get-started.md">Get Started</a>
		<a class="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg bg-indigo-500/10 text-indigo-500!" href="./configuration/">Configuration</a>
		<a class="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg bg-indigo-500/10 text-indigo-500!" href="https://www.npmjs.com/package/vite-plugin-php" target="_blank">NPM</a>
	</div>
</div>

<div class="max-w-[600px] mx-auto mb-12 rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
	<div class="flex gap-1.5 px-4 py-3 bg-gray-900">
		<span class="w-3 h-3 rounded-full bg-red-400"></span>
		<span class="w-3 h-3 rounded-full bg-yellow-400"></span>
		<span class="w-3 h-3 rounded-full bg-green-500"></span>
	</div>
	<pre><code class="language-js">// vite.config.js

import { defineConfig } from 'vite';
import usePHP from 'vite-plugin-php';

export default defineConfig({
plugins: [usePHP()],
});
</code></pre>

</div>

<div class="flex flex-wrap items-stretch justify-center gap-5 mx-auto mb-8">
	<div class="w-full max-w-xs p-6 rounded-xl border border-indigo-500/15 bg-indigo-500/[0.03] transition-all duration-150 hover:border-indigo-500/40 hover:-translate-y-1">
		<div class="text-[1.75rem] mb-3">&#9889;</div>
		<h3 class="text-lg font-bold mb-2">Vite-powered PHP</h3>
		<p class="m-0 opacity-85 leading-normal">
			Keep writing PHP while Vite handles assets, transforms, environment variables and hot module replacement.
		</p>
		<a class="inline-block mt-4 font-semibold text-indigo-500" href="./get-started.md">Start building</a>
	</div>
	<div class="w-full max-w-xs p-6 rounded-xl border border-indigo-500/15 bg-indigo-500/[0.03] transition-all duration-150 hover:border-indigo-500/40 hover:-translate-y-1">
		<div class="text-[1.75rem] mb-3">&#128208;</div>
		<h3 class="text-lg font-bold mb-2">Flexible configuration</h3>
		<p class="m-0 opacity-85 leading-normal">
			Point to a custom PHP binary, define multiple entry points, rewrite URLs and control PHP error reporting.
		</p>
		<a class="inline-block mt-4 font-semibold text-indigo-500" href="./configuration/">Explore options</a>
	</div>
	<div class="w-full max-w-xs p-6 rounded-xl border border-indigo-500/15 bg-indigo-500/[0.03] transition-all duration-150 hover:border-indigo-500/40 hover:-translate-y-1">
		<div class="text-[1.75rem] mb-3">&#127760;</div>
		<h3 class="text-lg font-bold mb-2">Multi-page routing</h3>
		<p class="m-0 opacity-85 leading-normal">
			Use globs to register many PHP pages and let the plugin route requests and build each entry correctly.
		</p>
		<a class="inline-block mt-4 font-semibold text-indigo-500" href="./routing/">See routing</a>
	</div>
	<div class="w-full max-w-xs p-6 rounded-xl border border-indigo-500/15 bg-indigo-500/[0.03] transition-all duration-150 hover:border-indigo-500/40 hover:-translate-y-1">
		<div class="text-[1.75rem] mb-3">&#128268;</div>
		<h3 class="text-lg font-bold mb-2">Pipeline integration</h3>
		<p class="m-0 opacity-85 leading-normal">
			Run additional Vite plugins before or after PHP processing via transformIndexHtml hooks.
		</p>
		<a class="inline-block mt-4 font-semibold text-indigo-500" href="./vite-pipeline/">Learn the pipeline</a>
	</div>
</div>

<div class="max-w-[960px] mx-auto px-4 py-8">
	<h2 class="text-2xl font-bold mb-4">What is vite-plugin-php?</h2>
	<p class="text-[1.05rem] leading-relaxed mb-6">
		<code>vite-plugin-php</code> bridges PHP and Vite. You keep your <code>index.php</code> entry file, server-side logic and includes, while Vite processes scripts, styles, images and environment variables just like it would for a static HTML project.
	</p>
	<p class="text-[1.05rem] leading-relaxed mb-6">
		During development the plugin starts a PHP development server behind the scenes, proxies requests through Vite and streams PHP errors into the Vite console. During production builds it feeds your PHP files through the standard Vite pipeline and writes each entry to the output directory.
	</p>
</div>

<div class="max-w-[960px] mx-auto px-4 py-8">
	<h2 class="text-2xl font-bold mb-4">Where to go next</h2>
	<ul>
		<li><a href="./get-started.md">Get Started</a> — install the plugin and render your first PHP page.</li>
		<li><a href="./configuration/">Configuration</a> — every option explained with copy-paste snippets.</li>
		<li><a href="./routing/">Routing</a> — how entry files map to URLs and build outputs.</li>
		<li><a href="./vite-pipeline/">Vite Pipeline</a> — integrate other plugins before or after PHP.</li>
		<li><a href="./examples/">Examples</a> — multi-entry apps, React + PHP, external assets and more.</li>
		<li><a href="./limitations/">Limitations</a> — things to know about inline modules and dynamic assets.</li>
	</ul>
</div>

<div class="text-center px-4 py-8 opacity-70 text-sm">
	Made by <a href="https://donnikitos.com/" target="_blank">Nikita "donnikitos" Nitichevski</a>.
	<br />
	<a href="https://github.com/donnikitos/vite-plugin-php">GitHub</a> ·
	<a href="https://github.com/donnikitos/vite-plugin-php/discussions">Discussions</a> ·
	<a href="https://github.com/donnikitos/vite-plugin-php/issues">Issues</a>
</div>
