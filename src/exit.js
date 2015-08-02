var Promise = require("bluebird");
var fs = require("fs");
var db = require("./store/db");
var unlink = Promise.promisify(fs.unlink);
var readFile = Promise.promisify(fs.readFile);
function exit() {
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
    return db.destroy()
        .then(function () { return unlink("slownode.db"); })
        .then(function () { return true; })
        .catch(function () { return false; });
}
module.exports = exit;
//# sourceMappingURL=exit.js.map