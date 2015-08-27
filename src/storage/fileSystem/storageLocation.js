var path = require('path');
var main = require('../../mainInfo');
var relPath = (main.packageJson.slownode || {}).location || 'slowlog.txt';
var absPath = path.isAbsolute(relPath) ? relPath : path.join(main.path, relPath);
module.exports = absPath;
//# sourceMappingURL=storageLocation.js.map