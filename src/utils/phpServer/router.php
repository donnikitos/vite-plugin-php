<?php
$sourceFile = $_SERVER['SCRIPT_FILENAME'];

$source = file_get_contents($sourceFile);
$codeTokens = json_decode(file_get_contents("$sourceFile.json"), true);

$source = str_replace(
	array_keys($codeTokens),
	array_values($codeTokens),
	$source,
);

die((function ($__SOURCE) {
	eval("?>$__SOURCE<?php");
})($source));
