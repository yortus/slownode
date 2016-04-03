var fs = require('fs');
var path = require('path');


// Add skownode.js and slownode.d.ts to slownode's own node_modules folder, so it can require() itself (e.g. in tests).
fs.writeFileSync(path.join(__dirname, '../node_modules/slownode.js'), `module.exports = require('..');`);
fs.writeFileSync(path.join(__dirname, '../node_modules/slownode.d.ts'), `export * from '..';`);
