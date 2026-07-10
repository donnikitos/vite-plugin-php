import { describe, it, expect } from 'bun:test';
import { fixAssetsInjection } from '../../../src/utils/fixAssetsInjection';

describe('fixAssetsInjection', () => {
	it('moves asset tags out of PHP namespace blocks', () => {
		const input =
			'<script src="/assets/main.js"></script>\n' +
			'<?php namespace App; ?>\n' +
			'<h1>Hello</h1>';

		const out = fixAssetsInjection(input);

		expect(out).toInclude('<script src="/assets/main.js"');
		expect(out).not.toMatch(/<script[^\u003e]*>\s*<\?php\s+namespace/);
		expect(out.indexOf('<?php namespace')).toBeLessThan(
			out.indexOf('<script'),
		);
	});

	it('places extracted assets after the last HTML tag', () => {
		const input =
			'<link rel="stylesheet" href="/assets/main.css">\n' +
			'<?php namespace App; ?>\n' +
			'<body>\n<h1>Hello</h1>\n</body>';

		const out = fixAssetsInjection(input);

		expect(out).toInclude('</body>');
		expect(out.indexOf('</body>')).toBeLessThan(
			out.indexOf('<link rel="stylesheet"'),
		);
	});

	it('returns input unchanged when there is no namespace block', () => {
		const input = '<h1>Hello</h1>';
		expect(fixAssetsInjection(input)).toBe(input);
	});
});
