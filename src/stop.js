var fs = require("fs");
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Promise = require("bluebird");
var db = require('./store/db');
var dbpath = require('./dbpath');
var stat = Promise.promisify(fs.stat);
var unlink = Promise.promisify(fs.unlink);
var stop = async(function () {
    // If the file does not exist, there is nothing to do so just return normally.
    try {
        await(stat(dbpath));
    }
    catch (ex) {
        return;
    }
    // The file does exist. Attempt to delete it.
    await(db.destroy());
    await(unlink(dbpath));
});
module.exports = stop;
//# sourceMappingURL=stop.js.map