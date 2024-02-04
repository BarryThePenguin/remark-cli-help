/**
 * @typedef {import('remark-cli-help').Options} Config
 * @typedef {import('vfile').VFile} VFile
 */

import {readdirSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import test from 'ava';
import {remark} from 'remark';
import cliHelp from '../index.js';

test('cliHelp()', (t) => {
  t.is(typeof cliHelp, 'function', 'should be a function');

  t.notThrows(() => {
    cliHelp.call(remark);
  }, 'should not throw if not passed options');
});

const root = new URL('fixtures/', import.meta.url);
const fixtures = readdirSync(root).filter(
  (fixture) => !fixture.startsWith('.')
);

/**
 * @type {import('ava').Macro<[input?: string], unknown>}
 */
const macro = test.macro(async function (t, input) {
  const folderUrl = new URL(input + '/', root);
  const inputUrl = new URL('readme.md', folderUrl);
  const configUrl = new URL('config.json', folderUrl);

  /** @type {Config | undefined} */
  let config;
  /** @type {VFile} */
  let result;

  try {
    config = JSON.parse(String(await readFile(configUrl)));
  } catch {}

  try {
    result = await remark()
      .use(cliHelp, config)
      .process({
        cwd: fileURLToPath(folderUrl),
        value: await readFile(inputUrl)
      });

    t.snapshot(String(result));
  } catch (error) {
    if (input?.indexOf('fail-') !== 0) {
      throw error;
    }

    const message = input.slice(5).replaceAll('-', ' ');

    t.regex(
      String(error).replaceAll('`', ''),
      new RegExp(message, 'i'),
      `should fail on \`'${input}'\``
    );
  }
});

for (const fixture of fixtures) {
  test(`Fixtures: ${fixture}`, macro, fixture);
}
