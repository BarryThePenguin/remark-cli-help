import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import test from 'ava';
import {remark} from 'remark';
import hidden from 'is-hidden';
import negate from 'negate';
import cliHelp from '../index.js';

const read = fs.readFileSync;

test('cliHelp()', (t) => {
  t.is(typeof cliHelp, 'function', 'should be a function');

  t.notThrows(() => {
    cliHelp.call(remark);
  }, 'should not throw if not passed options');
});

const root = new URL('fixtures/', import.meta.url);
const fixtures = fs.readdirSync(root).filter(negate(hidden));

function macro(t, expected) {
  const folderUrl = new URL(expected + '/', root);
  const inputUrl = new URL('readme.md', folderUrl);
  const configUrl = new URL('config.json', folderUrl);

  let config;
  let result;

  try {
    config = JSON.parse(String(read(configUrl)));
  } catch {}

  try {
    result = remark()
      .use(cliHelp, {
        ...config,
        cwd: fileURLToPath(folderUrl)
      })
      .processSync(read(inputUrl))
      .toString();

    t.snapshot(result);
  } catch (error) {
    if (expected.indexOf('fail-') !== 0) {
      throw error;
    }

    const message = expected.slice(5).replace(/-/g, ' ');

    t.regex(
      String(error).replace(/`/g, ''),
      new RegExp(message, 'i'),
      'should fail on `' + expected + '`'
    );
  }
}

for (const fixture of fixtures) {
  test(`Fixtures: ${fixture}`, macro, fixture);
}
