# remark-cli-help

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

Add cli help output to a README with [**remark**][remark].

## Installation

[npm][]:

```bash
npm install remark-cli-help
```

## Usage

Dependencies:

```javascript
import {remark} from 'remark';
import {VFile} from 'vfile';
import cliHelp from 'remark-cli-help';
```

Given a file:

```javascript
const output = remark()
  .use(cliHelp, {bin: 'remark'})
  .processSync(new VFile('## cli'))
  .toString();
```

Yields:

````markdown
## cli

```markdown
$ remark-cli-help --help

Usage: remark [options] [path | glob ...]

  CLI to process Markdown with remark

Options:

  -h  --help                              output usage information
  -v  --version                           output version number
  -o  --output [path]                     specify output location
  -r  --rc-path <path>                    specify configuration file
  -i  --ignore-path <path>                specify ignore file
  -s  --setting <settings>                specify settings
  -e  --ext <extensions>                  specify extensions
  -u  --use <plugins>                     use plugins
  -w  --watch                             watch for changes and reprocess
  -q  --quiet                             output only warnings and errors
  -S  --silent                            output only errors
  -f  --frail                             exit with 1 on warnings
  -t  --tree                              specify input and output as syntax tree
      --report <reporter>                 specify reporter
      --file-path <path>                  specify path to process as
      --ignore-path-resolve-from dir|cwd  resolve patterns in `ignore-path` from its directory or cwd
      --ignore-pattern <globs>            specify ignore patterns
      --silently-ignore                   do not fail when given ignored files
      --tree-in                           specify input as syntax tree
      --tree-out                          output syntax tree
      --inspect                           output formatted syntax tree
      --[no-]stdout                       specify writing to stdout (on by default)
      --[no-]color                        specify color in report (on by default)
      --[no-]config                       search for configuration files (on by default)
      --[no-]ignore                       search for ignore files (on by default)

Examples:

  # Process `input.md`
  $ remark input.md -o output.md

  # Pipe
  $ remark < input.md > output.md

  # Rewrite all applicable files
  $ remark . -o
```
````

## API

### `remark.use(cliHelp[, options])`

Adds the output from `node ./cli.js --help` to the `cli` section in a `readme.md`.

Removes the current content between the heading containing the text “cli”,
and the next heading of the same (or higher) depth, and replaces it with
the help output.

#### `options`

##### `options.cwd`

`string?` — Path to a directory containing a node module.  Used to infer `name`,
`main`, and `bin`.

###### `options.name`

`string?` — Name of the command, inferred from `package.json`s `name` property.
Used to write the help command output `$ some-command --help`.

###### `options.bin`

`string?` — Path to the cli script.  Resolved from `package.json`s `bin`
property (or `cli.js`).  See the [npm documentation][package-json-bin]
for more details

##### `options.args`

`Array<string>?` — Arguments used to run the help command.  Defaults to `['--help']`

###### `options.heading`

`string?`, default: `'cli'` — Heading to look for, wrapped in
`new RegExp('^(' + value + ')$', 'i');`.

## Contribute

See [`contributing.md` in `remarkjs/remark`][contributing] for ways to get
started.

This organisation has a [Code of Conduct][coc].  By interacting with this
repository, organisation, or community you agree to abide by its terms.

## License

[MIT][license] © [Jonathan Haines][author]

<!-- Definitions -->

[build-badge]: https://github.com/BarryThePenguin/remark-cli-help/workflows/CI/badge.svg

[build]: https://github.com/BarryThePenguin/remark-cli-help/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/BarryThePenguin/remark-cli-help.svg

[coverage]: https://codecov.io/github/BarryThePenguin/remark-cli-help

[downloads-badge]: https://img.shields.io/npm/dm/remark-cli-help.svg

[downloads]: https://www.npmjs.com/package/remark-cli-help

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/remarkjs/remark/discussions

[size-badge]: https://img.shields.io/bundlephobia/minzip/remark-cli-help.svg

[size]: https://bundlephobia.com/result?p=remark-cli-help

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[license]: license

[author]: https://jonno.dev/

[npm]: https://docs.npmjs.com/cli/install

[package-json-bin]: https://docs.npmjs.com/files/package.json#bin

[remark]: https://github.com/remarkjs/remark

[contributing]: https://github.com/remarkjs/remark/blob/master/contributing.md

[coc]: https://github.com/remarkjs/remark/blob/master/code-of-conduct.md
