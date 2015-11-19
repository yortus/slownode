var path = require('path');
var findRoot = require('find-root');
// TODO: doc.. this allows path to be set by slownode.config(...) or similar.
// TODO: disallow set() calls after first get() call is made
function set(absolutePath) {
    if (absPath)
        throw new Error('path cannot be changed after first access.');
    absPath = absolutePath;
}
// TODO: doc...
function get() {
    if (absPath)
        return absPath;
    // TODO: how reliable? What would an invalid case look like? Consequences? What if not found? Fail? Continue?
    /** The path of the closest containing directory of the main module that contains a package.json file. */
    var mainPath = findRoot(require.main.filename);
    /** The parsed contents of the package.json file located in `path`. */
    var packageJson = require(path.join(mainPath, './package.json'));
    // TODO: doc...
    var relPath = (packageJson.slownode || {}).location || 'slownode.db';
    absPath = path.isAbsolute(relPath) ? relPath : path.join(mainPath, relPath);
}
// TODO: doc...
var absPath;
module.exports = absPath;
//# sourceMappingURL=storageLocation.js.map