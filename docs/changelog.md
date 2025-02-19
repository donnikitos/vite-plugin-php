# Changelog

### Major release 2.0.0

-   Rewritten and improved plugin code -> cleaner and more understandable codebase
-   No more code escaping during development -> faster and less intensive processing
-   Implemented PHP error logging directly into Vite console
    -   Error levels are adjustable, just like in the good ol' PHP
-   Fixed env replacements during development
-   Fixed file inclusion during development
-   Improved asset injection for namespaced files
-   Improved plugin shutdown and cleanup functionality

\
### Releases >= 1.0.0

| Version | Feature                                                                                                                            |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.71  | Fixed assets prepending for namespaced PHP-files                                                                                   |
| 1.0.70  | Added include path override for relative PHP imports in dev mode                                                                   |
| 1.0.69  | Using new token format to escape PHP in HTML                                                                                       |
| 1.0.68  | Improved transpiled code evaluation (removed native `eval()`)                                                                      |
| 1.0.67  | Removed whitespaces from PHP responses in dev mode                                                                                 |
| 1.0.66  | Fixed file monitoring on Windows                                                                                                   |
| 1.0.651 |                                                                                                                                    |
| 1.0.65  | Fixed request body forwarding for all request methods                                                                              |
| 1.0.62  | HTML transforms are now only applied to HTML contents during dev                                                                   |
| 1.0.61  |                                                                                                                                    |
| 1.0.60  | Fixed inline module transpiling -> PHP code is being properly inserted into transpiled inline module chunks                        |
| 1.0.55  |                                                                                                                                    |
| 1.0.50  |                                                                                                                                    |
| 1.0.40  |                                                                                                                                    |
| 1.0.31  |                                                                                                                                    |
| 1.0.30  |                                                                                                                                    |
| 1.0.20  |                                                                                                                                    |
| 1.0.11  |                                                                                                                                    |
| 1.0.10  |                                                                                                                                    |
| 1.0.9   |                                                                                                                                    |
| 1.0.8   |                                                                                                                                    |
| 1.0.7   |                                                                                                                                    |
| 1.0.6   | Since version 1.0.6 you can specify wildcard entry points                                                                          |
| 1.0.5   |                                                                                                                                    |
| 1.0.4   |                                                                                                                                    |
| 1.0.1   | Since version `^1.0.0` the plugin uses PHP's dev-server to compute PHP code and to provide all usual server variables and features |

\
### Initial beta release

| Version | Feature                                                                                                                            |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 0.9.1   |                                                                                                                                    |
| 0.9.0   |                                                                                                                                    |
