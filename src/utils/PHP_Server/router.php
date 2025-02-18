<?php
$internal_param = '__314159265359__';

parse_str($_GET[$internal_param], $internal_vars);
unset($_GET[$internal_param]);

ini_set('log_errors', 0); // Disable logging
ini_set( // Just in case: set to writable file
	'error_log',
	sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'php-' . getmypid() . '.log',
);

set_error_handler(function (
	$code,
	$message,
	$file = null,
	$line = 0,
	$context = [],
) use ($internal_param) {
	file_put_contents(
		'php://stdout',
		"$internal_param:" . json_encode(
			[
				'code' => $code,
				'message' => $message,
				'file' => $file,
				'line' => $line,
				'context' => $context,
			],
			JSON_FORCE_OBJECT | JSON_NUMERIC_CHECK | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE,
		) . "\r\n",
	);
}, $internal_vars['error_levels'] ?? E_ALL);

$sourceFile = $_SERVER['SCRIPT_FILENAME'];

foreach ($internal_vars as $key => $value) {
	if (str_starts_with($key, '$')) {
		$_SERVER[substr($key, 1)] = $value;
	}
}

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
