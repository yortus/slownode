import path = require('path');
import main = require('../../mainInfo');
export = absPath;


var relPath = (main.packageJson.slownode || {}).database || 'slownode.db';
var absPath = path.isAbsolute(relPath) ? relPath : path.join(main.path, relPath);
