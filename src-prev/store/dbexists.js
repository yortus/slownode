var fs = require("fs");
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Promise = require("bluebird");
var dbpath = require('../dbpath');
var stat = Promise.promisify(fs.stat);
var dbexists = async(function () {
    // If the file does not exist, there is nothing to do so just return normally.
    try {
        await(stat(dbpath));
        return true;
    }
    catch (ex) {
        return false;
    }
});
module.exports = dbexists;
//# sourceMappingURL=dbexists.js.map