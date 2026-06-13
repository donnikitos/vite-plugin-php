import { describe, it, expect, beforeEach } from 'bun:test';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { resolveConfig } from 'vite';
import PHP_Code from '../../../src/utils/PHP_Code';
import { shared } from '../../../src/shared';
import { tmpDir } from '../../setup';

describe('PHP_Code', () => {
	beforeEach(async () => {
		shared.viteConfig = await resolveConfig({}, 'build');
	});

	describe('fromFile', () => {
		it('reads PHP code from a file and stores the filename', () => {
			const file = join(tmpDir, 'page.php');
			writeFileSync(file, '<?php echo 1; ?>', 'utf-8');

			const php = PHP_Code.fromFile(file);

			expect(php.file).toBe(file);
			expect(php.code).toBe('<?php echo 1; ?>');
		});
	});

	describe('escape', () => {
		it('replaces PHP tags with unique tokens and stores exact originals in mapping', () => {
			const snippets = ['<?php echo "hi"; ?>', '<?= $name ?>'];
			const original = `before ${snippets[0]} middle ${snippets[1]} after`;
			const php = new PHP_Code(original);
			php.file = 'index.php';
			php.escape();

			expect(php.code).not.toInclude('<?php');
			expect(php.code).not.toInclude('<?=');
			expect(php.code).not.toInclude('?>');

			expect(Object.keys(php.mapping).length).toBe(2);

			Object.entries(php.mapping).forEach(([token, value]) => {
				expect(php.code).toContain(token);
				expect(php.mapping[token]).toBe(value);
			});
		});

		it('uses /*token*/ style escaping for .js/.ts files', () => {
			const php = new PHP_Code('const x = `<?php echo 1; ?>`;');
			php.file = 'app.js';
			php.escape();

			expect(php.code).not.toInclude('<?');
			expect(php.code).not.toInclude('?>');

			const token = Object.keys(php.mapping)[0];
			expect(token).toStartWith('/*');
			expect(token).toEndWith('*/');
		});

		it('uses ␀␀token␀␀ style escaping for .php/.html/.htm files', () => {
			for (const ext of ['index.php', 'page.html', 'template.htm']) {
				const php = new PHP_Code('<?php echo 1; ?>');
				php.file = ext;
				php.escape();

				expect(php.code).not.toInclude('<?');
				expect(php.code).not.toInclude('?>');

				const token = Object.keys(php.mapping)[0];
				expect(token).toStartWith('␀␀');
				expect(token).toEndWith('␀␀');
			}
		});

		it('uses plain token string escapes for other extensions', () => {
			const php = new PHP_Code('<?php echo 1; ?>');
			php.file = 'style.css';
			php.escape();

			const token = Object.keys(php.mapping)[0];
			expect(token).not.toInclude('/*');
			expect(token).not.toInclude('␀␀');
		});

		it('handles short open tag', () => {
			const snippet = '<?= $title ?>';
			const php = new PHP_Code(`<h1>${snippet}</h1>`);
			php.file = 'index.php';
			php.escape();

			expect(php.code).not.toInclude('<?');
			expect(php.code).not.toInclude('?>');

			expect(Object.values(php.mapping)[0]).toBe(snippet);
		});

		it('handles unclosed trailing PHP block', () => {
			const snippet = '<?php echo $x;';
			const php = new PHP_Code(`before ${snippet}`);
			php.file = 'index.php';
			php.escape();

			expect(php.code).not.toInclude('<?');

			expect(Object.values(php.mapping)[0]).toBe(snippet);
		});

		it('handles empty PHP block', () => {
			const snippet = '<?php ?>';
			const php = new PHP_Code(snippet);
			php.file = 'index.php';
			php.escape();

			expect(Object.values(php.mapping)[0]).toBe(snippet);
		});

		it('handles PHP inside HTML attribute', () => {
			const snippet = '<?php echo $class; ?>';
			const original = `<div class="${snippet}"></div>`;
			const php = new PHP_Code(original);
			php.file = 'index.php';
			php.escape();

			expect(php.code).not.toInclude('<?');
			expect(php.code).not.toInclude('?>');

			expect(Object.values(php.mapping)[0]).toBe(snippet);
			expect(PHP_Code.unescape(php.code, php.mapping)).toBe(original);
		});

		it('handles multiple identical PHP blocks as separate tokens', () => {
			const snippet = '<?php echo "x"; ?>';
			const original = `${snippet} ${snippet}`;
			const php = new PHP_Code(original);
			php.file = 'index.php';
			php.escape();

			expect(php.code).not.toInclude('<?');
			expect(php.code).not.toInclude('?>');

			expect(Object.keys(php.mapping).length).toBe(2);
			expect(Object.values(php.mapping).every((v) => v === snippet)).toBe(
				true,
			);
			expect(PHP_Code.unescape(php.code, php.mapping)).toBe(original);
		});

		it('handles PHP blocks with newlines and quotes', () => {
			const snippet =
				'<?php\n  $a = "line1\nline2";\n  echo $a;\n?\u003e';
			const original = `html\n${snippet}\nmore`;
			const php = new PHP_Code(original);
			php.file = 'index.php';
			php.escape();

			expect(Object.values(php.mapping)[0]).toBe(snippet);
			expect(PHP_Code.unescape(php.code, php.mapping)).toBe(original);
		});
	});

	describe('unescape', () => {
		it('restores all PHP tags exactly from mapping', () => {
			const original = 'before <?php echo "hi"; ?> after';
			const php = new PHP_Code(original);
			php.file = 'index.php';
			php.escape();

			expect(PHP_Code.unescape(php.code, php.mapping)).toBe(original);
		});

		it('handles multiple PHP blocks', () => {
			const original = '<?php $a=1; ?> html <?php echo $a; ?>';
			const php = new PHP_Code(original);
			php.file = 'index.php';
			php.escape();

			expect(PHP_Code.unescape(php.code, php.mapping)).toBe(original);
		});

		it('returns input unchanged with empty mapping', () => {
			const input = '<h1>Hello</h1>';
			expect(PHP_Code.unescape(input, {})).toBe(input);
		});

		it('does not replace tokens that are substrings of one another', () => {
			const mapping = {
				abc: '<?php echo 1; ?>',
				abcdef: '<?php echo 2; ?>',
			};
			const input = 'abc def abcdef';
			const out = PHP_Code.unescape(input, mapping);

			expect(out).toInclude('<?php echo 1; ?>');
			expect(out).toInclude('<?php echo 2; ?>');
			expect(out).not.toBe('<?php echo 1; ?> def <?php echo 1; ?> def');
		});
	});

	describe('applyEnv', () => {
		it('replaces a single %VAR% placeholder', () => {
			shared.viteConfig!.env.VITE_APP_TITLE = 'My App';

			const php = new PHP_Code('<title>%VITE_APP_TITLE%</title>');
			php.file = 'index.php';
			php.applyEnv();

			expect(php.code).toBe('<title>My App</title>');
		});

		it('replaces multiple placeholders', () => {
			shared.viteConfig!.env.VITE_TITLE = 'Title';
			shared.viteConfig!.env.VITE_BODY = 'Body';

			const php = new PHP_Code('<h1>%VITE_TITLE%</h1><p>%VITE_BODY%</p>');
			php.file = 'index.php';
			php.applyEnv();

			expect(php.code).toBe('<h1>Title</h1><p>Body</p>');
		});

		it('replaces placeholders inside PHP code', () => {
			shared.viteConfig!.env.VITE_API_URL = 'https://api.example.com';

			const original = '<?php $api = "%VITE_API_URL%"; ?>';
			const php = new PHP_Code(original);
			php.file = 'index.php';
			php.applyEnv();

			expect(php.code).toBe('<?php $api = "https://api.example.com"; ?>');
		});

		it('keeps unknown placeholders untouched', () => {
			const php = new PHP_Code('<p>%UNKNOWN%</p>');
			php.file = 'index.php';
			php.applyEnv();

			expect(php.code).toBe('<p>%UNKNOWN%</p>');
		});

		it('resolves import.meta.env.define values', async () => {
			shared.viteConfig = await resolveConfig(
				{
					define: {
						'import.meta.env.CUSTOM': '"defined-value"',
					},
				},
				'build',
			);

			const php = new PHP_Code('<p>%CUSTOM%</p>');
			php.file = 'index.php';
			php.applyEnv();

			expect(php.code).toBe('<p>defined-value</p>');
		});

		it('combines env and define replacements', async () => {
			shared.viteConfig = await resolveConfig(
				{
					define: {
						'import.meta.env.FROM_DEFINE': '"define-value"',
					},
				},
				'build',
			);
			shared.viteConfig!.env.VITE_FROM_ENV = 'env-value';

			const php = new PHP_Code('<p>%VITE_FROM_ENV% %FROM_DEFINE%</p>');
			php.file = 'index.php';
			php.applyEnv();

			expect(php.code).toBe('<p>env-value define-value</p>');
		});
	});

	describe('write', () => {
		it('writes escaped code to disk', () => {
			const php = new PHP_Code('<?php echo 1; ?>');
			php.file = 'index.php';
			php.escape();

			const out = join(tmpDir, 'out.php');
			php.write(out);

			expect(existsSync(out)).toBe(true);
			expect(readFileSync(out, 'utf-8')).toBe(php.code);
		});

		it('writes mapping file when requested', () => {
			const php = new PHP_Code('<?php echo 1; ?>');
			php.file = 'index.php';
			php.escape();

			const out = join(tmpDir, 'out.php');
			php.write(out, true);

			expect(existsSync(out + '.json')).toBe(true);
			expect(JSON.parse(readFileSync(out + '.json', 'utf-8'))).toEqual(
				php.mapping,
			);
		});
	});
});
