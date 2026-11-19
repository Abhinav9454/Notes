const fs = require('fs');
const content = fs.readFileSync('springboot.html', 'utf8');

const idx = content.indexOf('<div class="app-layout"');
console.log('app-layout at index:', idx);
console.log(content.slice(idx, idx + 1500));

