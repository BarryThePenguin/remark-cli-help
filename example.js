// Dependencies:
import {remark} from 'remark';
import {VFile} from 'vfile';
import cliHelp from './index.js';

// Given a file:
const file = new VFile('## cli');
await remark().use(cliHelp, {bin: 'remark'}).process(file);

// Yields:
console.log('markdown', String(file));
