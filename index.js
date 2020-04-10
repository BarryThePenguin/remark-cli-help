'use strict';

const fs = require('fs');
const path = require('path');
const execa = require('execa');
const heading = require('mdast-util-heading-range');

module.exports = cliHelp;

const {existsSync} = fs;
const {resolve} = path;

const DEFAULT_HEADING = 'cli';
const DEFAULT_BIN = 'cli.js';

function cliHelp(options = {}) {
	let pack;
	const cwd = options.cwd || process.cwd();

	try {
		pack = require(resolve(cwd, 'package.json'));
	} catch {
		pack = {};
	}

	if (options.args && !Array.isArray(options.args)) {
		throw new Error('Invalid args: options.args must be an array');
	}

	const args = options.args || ['--help'];
	const name = options.name || pack.name || null;
	const cli = options.bin || pack.bin || DEFAULT_BIN;
	const header = toExpression(options.heading || DEFAULT_HEADING);

	return transform;

	function transform(tree) {
		heading(
			tree,
			header,
			runFactory({
				args,
				cwd,
				name,
				cli
			})
		);
	}
}

function runFactory({args, cli, cwd, name}) {
	return run;

	function run(start, nodes, end) {
		let commands;

		if (typeof cli === 'string') {
			commands = [{name, cli}];
		}

		if (typeof cli === 'object') {
			commands = mapCommands(cli);
		}

		if (!Array.isArray(commands)) {
			throw new TypeError('Invalid command');
		}

		const output = commands.map((command) => runCli(cwd, command, args));

		return [start].concat(output, end);
	}
}

function runCli(cwd, {cli, name}, args) {
	let process;
	const cliPath = resolve(cwd, cli);

	if (existsSync(cliPath)) {
		process = execa.sync('node', [cliPath, ...args]);
	} else {
		process = execa.sync(cli, args);
	}

	return processOutput(name || cli, args, process.stdout);
}

function processOutput(name, args, output) {
	return {
		type: 'code',
		lang: 'markdown',
		value: `$ ${name} ${args.join(' ')}

${output}`
	};
}

function mapCommands(commands, fn) {
	const values = (name) => ({name, cli: commands[name]});
	return Object.keys(commands).map(fn || values);
}

function toExpression(value) {
	return new RegExp('^(' + value + ')$', 'i');
}
