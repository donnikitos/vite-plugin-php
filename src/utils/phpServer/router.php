<?php
$sourceFile = $_SERVER['SCRIPT_FILENAME'];

$internal_param = '__314159265359__';
parse_str($_GET[$internal_param], $internal_vars);

foreach ($internal_vars as $key => $value) {
	if (str_starts_with($key, '$')) {
		$_SERVER[substr($key, 1)] = $value;
	}
}
unset($_GET[$internal_param]);

$_SERVER['SCRIPT_NAME'] = $_SERVER['PHP_SELF'];
$_SERVER['SCRIPT_FILENAME'] = $_SERVER['DOCUMENT_ROOT'] . $_SERVER['SCRIPT_NAME'];
$_SERVER['QUERY_STRING'] = http_build_query($_GET);

ini_set(
	'include_path',
	implode(PATH_SEPARATOR, [
		dirname($sourceFile),
		$_SERVER['DOCUMENT_ROOT'] . '/' . $internal_vars['temp_dir'],
		dirname($_SERVER['SCRIPT_FILENAME']),
		$_SERVER['DOCUMENT_ROOT'],
		ini_get('include_path'),
	]),
);

try {
	(function () {
		include(func_get_arg(0));
	})($sourceFile);
} catch (\Throwable $th) {
	print($th->getMessage());
}
