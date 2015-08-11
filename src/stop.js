var fs = require("fs");
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Promise = require("bluebird");
var settings = require('./settings');
var dbpath = require('./dbpath');
var dbexists = require('./store/dbexists');
var unlink = Promise.promisify(fs.unlink);
var stop = async(function () {
    // If the file does not exist, there is nothing to do so just return normally.
    if (!await(dbexists()))
        return true;
    // The file does exist. Attempt to delete it.
    if (settings.flushCallback)
        clearTimeout(settings.flushCallback);
    if (settings.connection)
        await(settings.connection.destroy());
    await(unlink(dbpath));
});
module.exports = stop;
//# sourceMappingURL=stop.js.map