'use strict';

const fs = require('fs');
const path = require('path');
const test = require('ava');
const remark = require('remark');
const hidden = require('is-hidden');
const negate = require('negate');
const cliHelp = require('..');

const read = fs.readFileSync;
const exists = fs.existsSync;

test('cliHelp()', t => {
	t.is(typeof cliHelp, 'function', 'should be a function');

	t.notThrows(() => {
		cliHelp.call(remark);
	}, 'should not throw if not passed options');
});

const ROOT = path.join(__dirname, 'fixtures');
const fixtures = fs.readdirSync(ROOT).filter(negate(hidden));

function macro(t, input, expected) {
	const filepath = ROOT + '/' + expected;
	let config = filepath + '/config.json';
	let result;
	let fail;

	config = exists(config) ? require(config) : {};

	config.cwd = filepath;

	fail = expected.indexOf('fail-') === 0 ? expected.slice(5) : '';

	try {
		result = remark()
			.use(cliHelp, config)
			.processSync(input)
			.toString();

		t.snapshot(result);
	} catch (error) {
		if (!fail) {
			throw error;
		}

		fail = new RegExp(fail.replace(/-/, ' '), 'i');

		t.regex(error.message, fail, 'should fail on `' + expected + '`');
	}
}

fixtures.forEach(fixture => {
	const filepath = ROOT + '/' + fixture;
	const input = read(filepath + '/readme.md', 'utf-8');

	test(`Fixtures: ${fixture}`, macro, input, fixture);
});
