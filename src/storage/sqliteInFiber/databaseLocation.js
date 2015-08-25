var path = require('path');
var main = require('../../mainInfo');
var relPath = (main.packageJson.slownode || {}).database || 'slownode.db';
var absPath = path.isAbsolute(relPath) ? relPath : path.join(main.path, relPath);
module.exports = absPath;
//# sourceMappingURL=databaseLocation.js.map