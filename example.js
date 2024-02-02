// Dependencies:
import {remark} from 'remark';
import {VFile} from 'vfile';
import cliHelp from './index.js';

// Given a file:
const output = remark()
  .use(cliHelp, {bin: 'remark'})
  .processSync(new VFile('## cli'))
  .toString();

// Yields:
console.log('markdown', output);
