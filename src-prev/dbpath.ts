import path = require('path');
var findRoot = require('find-root');
export = dbAbsPath;


var mainFile = require.main.filename;
var mainDir = findRoot(mainFile); // TODO: how reliable? What would an invalid case look like? Consequences? What if not found? Fail? Continue?
var mainPackageJson = require(path.join(mainDir, './package.json'));
var dbRelPath = (mainPackageJson.slownode || {}).database || 'slownode.db';
var dbAbsPath = path.isAbsolute(dbRelPath) ? dbRelPath : path.join(mainDir, dbRelPath);
