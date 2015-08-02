var Promise = require("bluebird");
var fs = require("fs");
var index_1 = require("./index");
var unlink = Promise.promisify(fs.unlink);
var readFile = Promise.promisify(fs.readFile);
function stop() {
    return databaseExists()
        .then(teardown);
}
function databaseExists() {
    return readFile("slownode.db")
        .then(function () { return true; })
        .catch(function () { return false; });
}
function teardown(exists) {
    if (!exists)
        return Promise.resolve(true);
    return index_1.connection.destroy()
        .then(function () { return unlink("slownode.db"); })
        .then(function () { return true; })
        .catch(function () { return false; });
}
module.exports = stop;
//# sourceMappingURL=stop.js.map