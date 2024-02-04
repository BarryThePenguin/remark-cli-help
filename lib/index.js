/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').RootContent} RootContent
 * @typedef {import('type-fest').PackageJson} PackageJson
 */

/**
 * @typedef PackageInfo
 *   Info on the package.
 * @property {PackageJson} value
 *   Data.
 * @property {VFile} file
 *   File.
 *
 * @typedef Command
 *  Command to run.
 * @property {string | null} name
 *  Name of the command.
 * @property {string} cli
 *  Path to the command.
 */

/**
 * @typedef Options
 *   Configuration.
 *
 * @property {string[] | null | undefined} [args]
 *  Arguments used to run the help command (default `['--help']`);
 *
 * @property {string | null | undefined} [bin]
 *  Path to the cli script. Resolved from `package.json`s `bin`
 *  property (or `cli.js`).  See the [npm documentation][package-json-bin]
 *  for more details
 *
 * @property {string | null | undefined} [cwd]
 *  Path to a directory containing a node module.  Used to infer `name`, `main`, and `bin`.
 *
 * @property {string | null | undefined} [heading]
 *   Heading to look for (default: `'usage'`);
 *   wrapped in `new RegExp('^(' + value + ')$', 'i');`.
 * @property {string | null | undefined} [name]
 *  Name of the module (default: `pkg.name`);
 *  used to rewrite `import x from './main.js'` to `import x from 'name'`.
 */

import {existsSync} from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {execa} from 'execa';
import {headingRange} from 'mdast-util-heading-range';
import {VFileMessage} from 'vfile-message';
import {VFile} from 'vfile';

const defaultHeading = 'cli';
const defaultBin = 'cli.js';

/** @type {Readonly<Options>} */
const emptyOptions = {};

/**
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 *
 * @returns
 *   Transform.
 */
export default function cliHelp(options) {
  const settings = options ?? emptyOptions;

  if (settings.args && !Array.isArray(settings.args)) {
    throw new Error('Invalid args: options.args must be an array');
  }

  const header = new RegExp(
    '^(' + (settings.heading ?? defaultHeading) + ')$',
    'i'
  );

  /**
   * Transform.
   *
   * @param {Root} tree
   *   Tree.
   *
   * @param {VFile} file
   *   File.
   *
   * @returns {Promise<undefined>}
   *   Nothing.
   */
  return async function (tree, file) {
    let exists = false;

    headingRange(tree, header, function () {
      exists = true;
    });

    if (!exists) {
      return;
    }

    const cwd = settings.cwd ?? file.cwd;

    const pkg = await findPackage(cwd);

    const args = settings.args ?? ['--help'];
    const name = settings.name ?? pkg?.value?.name ?? null;
    const cli = settings.bin ?? pkg?.value?.bin ?? defaultBin;

    /** @type {Command[] | null} */
    let commands = null;

    if (typeof cli === 'string') {
      commands = [{name, cli}];
    }

    if (typeof cli === 'object') {
      commands = mapCommands(cli);
    }

    if (!Array.isArray(commands)) {
      throw new TypeError('Invalid command');
    }

    const output = await Promise.all(
      commands.map((command) => runCli(cwd, command, args))
    );

    headingRange(tree, header, function (start, _, end) {
      return [start, ...output, end];
    });
  };
}

/**
 * @param {string} from
 *   From.
 * @returns {Promise<PackageInfo | undefined>}
 *   Nothing.
 */
async function findPackage(from) {
  const path = new URL('package.json', pathToFileURL(from));
  const file = new VFile({path});

  if (!existsSync(file.path)) return;

  const doc = String(await fs.readFile(file.path));

  /** @type {PackageJson} */
  let value;

  try {
    value = JSON.parse(doc);
  } catch (error) {
    const cause = /** @type {Error} */ (error);
    throw new VFileMessage('Cannot parse `package.json` as JSON', {
      cause,
      ruleId: 'package-json-invalid',
      source: 'remark-cli-help'
    });
  }

  return {value, file};
}

/**
 *
 * @param {string} cwd
 * @param {Command} command
 * @param {ReadonlyArray<string>} args
 * @returns
 */
async function runCli(cwd, {cli, name}, args) {
  const cliPath = path.resolve(cwd, cli);
  const {stdout} = await execa('node', [cliPath, ...args]).catch(() =>
    execa(cli, args, {cwd})
  );

  return processOutput(name ?? cli, args, stdout);
}

/**
 *
 * @param {string} name
 * @param {ReadonlyArray<string>} args
 * @param {string} output
 * @returns {RootContent}
 */
function processOutput(name, args, output) {
  return {
    type: 'code',
    lang: 'markdown',
    value: `$ ${name} ${args.join(' ')}

${output}`
  };
}

/**
 *
 * @param {Partial<Record<string, string>>} input
 * @returns {Command[]}
 */
function mapCommands(input) {
  /** @type {Command[]} */
  const commands = [];

  for (const [name, cli] of Object.entries(input)) {
    if (typeof cli === 'string') {
      commands.push({name, cli});
    }
  }

  return commands;
}
