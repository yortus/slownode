import path = require('path');
import main = require('../../mainInfo');
export = absPath;


var relPath = (main.packageJson.slownode || {}).location || 'slowlog.txt';
var absPath = path.isAbsolute(relPath) ? relPath : path.join(main.path, relPath);
