<style>
.vphp-hero {
	text-align: center;
	padding: 3rem 1rem 2rem;
}
.vphp-hero__logo {
	width: 140px;
	max-width: 100%;
	margin-bottom: 1.5rem;
}
.vphp-hero__title {
	font-size: 2.5rem;
	font-weight: 800;
	margin: 0 0 0.5rem;
	line-height: 1.1;
}
.vphp-hero__subtitle {
	font-size: 1.25rem;
	margin: 0 0 1.5rem;
	opacity: 0.85;
}
.vphp-badges {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 0.5rem;
	margin-bottom: 2rem;
}
.vphp-badges img {
	height: 24px;
}
.vphp-actions {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 0.75rem;
	margin-bottom: 2rem;
}
.vphp-button {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.75rem 1.25rem;
	border-radius: 0.5rem;
	font-weight: 600;
	text-decoration: none;
	transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.vphp-button:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}
.vphp-button--primary {
	background: #646cff;
	color: #fff;
}
.vphp-button--secondary {
	background: rgba(100, 108, 255, 0.1);
	color: #646cff;
}
.vphp-code-window {
	max-width: 600px;
	margin: 0 auto 3rem;
	border-radius: 0.75rem;
	overflow: hidden;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}
.vphp-code-window__bar {
	display: flex;
	gap: 0.4rem;
	padding: 0.75rem 1rem;
	background: #202330;
}
.vphp-code-window__dot {
	width: 0.75rem;
	height: 0.75rem;
	border-radius: 50%;
}
.vphp-code-window__dot--red { background: #ff5f56; }
.vphp-code-window__dot--yellow { background: #ffbd2e; }
.vphp-code-window__dot--green { background: #27c93f; }
.vphp-code-window pre {
	margin: 0;
	padding: 1.25rem;
	background: #161822;
	color: #e2e4f3;
	font-size: 0.9rem;
	line-height: 1.6;
	overflow-x: auto;
}
.vphp-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
	gap: 1.25rem;
	max-width: 960px;
	margin: 0 auto 2rem;
}
.vphp-card {
	padding: 1.5rem;
	border-radius: 0.75rem;
	border: 1px solid rgba(100, 108, 255, 0.15);
	background: rgba(100, 108, 255, 0.03);
	transition: border-color 0.15s ease, transform 0.15s ease;
}
.vphp-card:hover {
	border-color: rgba(100, 108, 255, 0.4);
	transform: translateY(-3px);
}
.vphp-card__icon {
	font-size: 1.75rem;
	margin-bottom: 0.75rem;
}
.vphp-card__title {
	font-size: 1.15rem;
	font-weight: 700;
	margin: 0 0 0.5rem;
}
.vphp-card__text {
	margin: 0;
	opacity: 0.85;
	line-height: 1.5;
}
.vphp-card__link {
	display: inline-block;
	margin-top: 1rem;
	font-weight: 600;
	color: #646cff;
	text-decoration: none;
}
.vphp-section {
	max-width: 960px;
	margin: 0 auto;
	padding: 2rem 1rem;
}
.vphp-section__title {
	font-size: 1.75rem;
	font-weight: 700;
	margin: 0 0 1rem;
}
.vphp-section__text {
	font-size: 1.05rem;
	line-height: 1.7;
	margin: 0 0 1.5rem;
}
.vphp-footer {
	text-align: center;
	padding: 2rem 1rem;
	opacity: 0.7;
	font-size: 0.9rem;
}
</style>

<div class="vphp-hero">
	<h1 class="vphp-hero__title">vite-plugin-php</h1>
	<p class="vphp-hero__subtitle">
		Use Vite's speed, HMR and ecosystem to build with PHP.
	</p>
	<div class="vphp-badges">
		<a href="https://github.com/donnikitos/vite-plugin-php/blob/master/LICENSE" target="_blank">
			<img src="https://img.shields.io/github/license/donnikitos/vite-plugin-php?color=blue&style=for-the-badge" alt="License" />
		</a>
		<a href="https://www.npmjs.com/package/vite-plugin-php" target="_blank">
			<img src="https://img.shields.io/npm/dt/vite-plugin-php?style=for-the-badge" alt="NPM" />
		</a>
		<a href="https://github.com/donnikitos/vite-plugin-php" target="_blank">
			<img src="https://img.shields.io/github/stars/donnikitos/vite-plugin-php?label=GitHub%20Stars&style=for-the-badge" alt="GitHub Stars" />
		</a>
		<a href="https://github.com/donnikitos/vite-plugin-php/issues" target="_blank">
			<img src="https://img.shields.io/github/issues/donnikitos/vite-plugin-php?style=for-the-badge" alt="Issues" />
		</a>
	</div>
	<div class="vphp-actions">
		<a class="vphp-button vphp-button--primary" href="./get-started.md">Get Started</a>
		<a class="vphp-button vphp-button--secondary" href="./configuration/">Configuration</a>
		<a class="vphp-button vphp-button--secondary" href="https://www.npmjs.com/package/vite-plugin-php" target="_blank">NPM</a>
	</div>
</div>

<div class="vphp-code-window">
	<div class="vphp-code-window__bar">
		<span class="vphp-code-window__dot vphp-code-window__dot--red"></span>
		<span class="vphp-code-window__dot vphp-code-window__dot--yellow"></span>
		<span class="vphp-code-window__dot vphp-code-window__dot--green"></span>
	</div>
	<pre><code class="language-js">
// vite.config.js
import { defineConfig } from 'vite';
import usePHP from 'vite-plugin-php';

export default defineConfig({
plugins: [usePHP()],
});
</code></pre>

</div>

<div class="vphp-grid">
	<div class="vphp-card">
		<div class="vphp-card__icon">&#9889;</div>
		<h3 class="vphp-card__title">Vite-powered PHP</h3>
		<p class="vphp-card__text">
			Keep writing PHP while Vite handles assets, transforms, environment variables and hot module replacement.
		</p>
		<a class="vphp-card__link" href="./get-started.md">Start building</a>
	</div>
	<div class="vphp-card">
		<div class="vphp-card__icon">&#128208;</div>
		<h3 class="vphp-card__title">Flexible configuration</h3>
		<p class="vphp-card__text">
			Point to a custom PHP binary, define multiple entry points, rewrite URLs and control PHP error reporting.
		</p>
		<a class="vphp-card__link" href="./configuration/">Explore options</a>
	</div>
	<div class="vphp-card">
		<div class="vphp-card__icon">&#127760;</div>
		<h3 class="vphp-card__title">Multi-page routing</h3>
		<p class="vphp-card__text">
			Use globs to register many PHP pages and let the plugin route requests and build each entry correctly.
		</p>
		<a class="vphp-card__link" href="./routing/">See routing</a>
	</div>
	<div class="vphp-card">
		<div class="vphp-card__icon">&#128268;</div>
		<h3 class="vphp-card__title">Pipeline integration</h3>
		<p class="vphp-card__text">
			Run additional Vite plugins before or after PHP processing via transformIndexHtml hooks.
		</p>
		<a class="vphp-card__link" href="./vite-pipeline/">Learn the pipeline</a>
	</div>
</div>

<div class="vphp-section">
	<h2 class="vphp-section__title">What is vite-plugin-php?</h2>
	<p class="vphp-section__text">
		<code>vite-plugin-php</code> bridges PHP and Vite. You keep your <code>index.php</code> entry file, server-side logic and includes, while Vite processes scripts, styles, images and environment variables just like it would for a static HTML project.
	</p>
	<p class="vphp-section__text">
		During development the plugin starts a PHP development server behind the scenes, proxies requests through Vite and streams PHP errors into the Vite console. During production builds it feeds your PHP files through the standard Vite pipeline and writes each entry to the output directory.
	</p>
</div>

<div class="vphp-section">
	<h2 class="vphp-section__title">Where to go next</h2>
	<ul>
		<li><a href="./get-started.md">Get Started</a> — install the plugin and render your first PHP page.</li>
		<li><a href="./configuration/">Configuration</a> — every option explained with copy-paste snippets.</li>
		<li><a href="./routing/">Routing</a> — how entry files map to URLs and build outputs.</li>
		<li><a href="./vite-pipeline/">Vite Pipeline</a> — integrate other plugins before or after PHP.</li>
		<li><a href="./examples/">Examples</a> — multi-entry apps, React + PHP, external assets and more.</li>
		<li><a href="./limitations/">Limitations</a> — things to know about inline modules and dynamic assets.</li>
	</ul>
</div>

<div class="vphp-footer">
	Made by <a href="https://donnikitos.com/" target="_blank">Nikita "donnikitos" Nitichevski</a>.
	<br />
	<a href="https://github.com/donnikitos/vite-plugin-php">GitHub</a> ·
	<a href="https://github.com/donnikitos/vite-plugin-php/discussions">Discussions</a> ·
	<a href="https://github.com/donnikitos/vite-plugin-php/issues">Issues</a>
</div>
