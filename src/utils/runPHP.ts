import { execSync } from 'child_process';

export type PHP_CLI_Args = {
	no_chdir?: boolean;
	no_header?: boolean;
	php_ini?: string;
	no_php_ini?: boolean;
	define?: Record<string, string>;
	profile_info?: boolean;
	process_begin?: string;
	process_code?: string;
	process_file?: string;
	process_end?: string;
};

function runPHP(input: string, args: PHP_CLI_Args = {}) {
	const params: string[] = [runPHP.binary];
	Object.entries(args).forEach(([optionName, value]) => {
		if (optionName === 'define') {
			Object.entries(value).forEach(([k, v]) => {
				params.push(`--${optionName} ${k}=${v}`);
			});
		} else {
			const name = optionName.replaceAll('_', '-');

			params.push(`--${name} ${value}`);
		}
	});

	let i = input;
	i = i.replaceAll("'", "'\"'\"'");
	i = `echo '${i}' | ` + params.join(' ');

	return execSync(i).toString();
}
runPHP.binary = 'php';

export default runPHP;
