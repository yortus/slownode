import path = require('path');
var findRoot = require('find-root');
export = absPath;


var mainFile = require.main.filename;
var mainDir = findRoot(mainFile); // TODO: how reliable? What would an invalid case look like? Consequences? What if not found? Fail? Continue?
var mainPackageJson = require(path.join(mainDir, './package.json'));
var relPath = (mainPackageJson.slownode || {}).database || 'slownode.db';
var absPath = path.isAbsolute(relPath) ? relPath : path.join(mainDir, relPath);
