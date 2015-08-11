import fs = require("fs");
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import Promise = require("bluebird")
import settings = require('./settings');
import dbpath = require('./dbpath');
import dbexists = require('./store/dbexists');
var unlink = Promise.promisify(fs.unlink);
export = stop;


var stop = async(() => {

    // If the file does not exist, there is nothing to do so just return normally.
    if (!await(dbexists())) return true;

    // The file does exist. Attempt to delete it.
    if (settings.flushCallback) clearTimeout(settings.flushCallback);
    if (settings.connection) await(settings.connection.destroy());
    await(unlink(dbpath));
});
