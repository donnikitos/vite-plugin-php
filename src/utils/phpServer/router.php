<?php
$sourceFile = $_SERVER['SCRIPT_FILENAME'];

$internal_param = '__314159265359__';
parse_str($_GET[$internal_param], $internal_vars);

foreach ($internal_vars as $key => $value) {
	$_SERVER[$key] = $value;
}
unset($_GET[$internal_param]);

$_SERVER['SCRIPT_NAME'] = $_SERVER['PHP_SELF'];
$_SERVER['SCRIPT_FILENAME'] = $_SERVER['DOCUMENT_ROOT'] . $_SERVER['SCRIPT_NAME'];
$_SERVER['QUERY_STRING'] = http_build_query($_GET);

$source = file_get_contents($sourceFile);

$tokensFile = "$sourceFile.json";
if (file_exists($tokensFile)) {
	$codeTokens = json_decode(file_get_contents($tokensFile), true);

	$source = str_replace(
		array_keys($codeTokens),
		array_values($codeTokens),
		$source,
	);
}

preg_match('#<\?((?!\?>).)*$#s', $source, $matches);

if (count($matches)) {
	$source .= ' ?>';
}

$includeFile = tempnam(sys_get_temp_dir(), 'vite-php');
register_shutdown_function(function ($file) {
	if (file_exists($file)) {
		unlink($file);
	}
}, $includeFile);
file_put_contents($includeFile, $source);

try {
	(function () {
		include(func_get_arg(0));
	})($includeFile);
} catch (\Throwable $th) {
	print($th->getMessage());
}
