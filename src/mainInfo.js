var pth = require('path');
var findRoot = require('find-root');
// TODO: how reliable? What would an invalid case look like? Consequences? What if not found? Fail? Continue?
/** The path of the closest containing directory of the main module that contains a package.json file. */
exports.path = findRoot(require.main.filename);
/** The parsed contents of the package.json file located in `path`. */
exports.packageJson = require(pth.join(exports.path, './package.json'));
//# sourceMappingURL=mainInfo.js.map