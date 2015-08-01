var Promise = require("bluebird");
var fs = require("fs");
var db = require("./store/db");
var unlink = Promise.promisify(fs.unlink);
function exit() {
    return db.destroy()
        .then(function () { return unlink("slownode.db"); })
        .then(function () { return true; })
        .catch(function () { return false; });
}
module.exports = exit;
//# sourceMappingURL=exit.js.map