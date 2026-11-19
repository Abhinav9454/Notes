const fs = require('fs');
const content = fs.readFileSync('public/js/outlines-data.js', 'utf8');

const vm = require('vm');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(content, sandbox);

console.log('DSA outline in outlines-data.js:');
console.log(JSON.stringify(sandbox.window.NOTEBOOK_OUTLINES.dsa, null, 2));

