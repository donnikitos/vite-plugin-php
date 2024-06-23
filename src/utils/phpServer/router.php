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
$codeTokens = json_decode(file_get_contents("$sourceFile.json"), true);

$source = str_replace(
	array_keys($codeTokens),
	array_values($codeTokens),
	$source,
);

die((function ($__SOURCE) {
	try {
		return eval("?> $__SOURCE <?php");
	} catch (\Throwable $th) {
		return $th->getMessage();
	}
})($source));
