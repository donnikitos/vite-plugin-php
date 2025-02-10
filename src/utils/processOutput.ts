const namespacePattern = new RegExp(
	/(.+?)(<\?(?:php|)\s+namespace\s\S+?(?:\s*;|\s*{).+)(<\/.+?>|<.+?\/>)(.+|$)/,
	'si',
);

export function processOutput(input: string) {
	let out = input;

	out = out.replace(
		namespacePattern,
		(match, assets, contents, lastTag, trailingContent) =>
			contents + lastTag + '\r\n' + assets.trim() + trailingContent,
	);

	return out;
}
