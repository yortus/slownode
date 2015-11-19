import path = require('path');
var findRoot = require('find-root');
export = absPath;


// TODO: how reliable? What would an invalid case look like? Consequences? What if not found? Fail? Continue?
/** The path of the closest containing directory of the main module that contains a package.json file. */
var mainPath = findRoot(require.main.filename);


/** The parsed contents of the package.json file located in `path`. */
var packageJson = require(path.join(mainPath, './package.json'));


// TODO: doc...
var relPath = (packageJson.slownode || {}).location || 'slownode.db';
var absPath = path.isAbsolute(relPath) ? relPath : path.join(mainPath, relPath);
