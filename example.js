// Dependencies:
const remark = require('remark');
const vfile = require('vfile');
const cliHelp = require('.');

// Given a file:
const output = remark()
	.use(cliHelp, {bin: 'remark'})
	.processSync(vfile('## cli'))
	.toString();

// Yields:
console.log('markdown', output);
