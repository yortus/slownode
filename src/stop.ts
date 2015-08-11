import fs = require("fs");
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import Promise = require("bluebird")
import slow = require('./index');
import dbpath = require('./dbpath');
import dbexists = require('./store/dbexists');
var unlink = Promise.promisify(fs.unlink);
export = stop;


var stop = async(() => {

    // If the file does not exist, there is nothing to do so just return normally.
    if (!await(dbexists())) return true;

    // The file does exist. Attempt to delete it.
    var db = slow.connection;
    if (db) await(db.destroy());
    await(unlink(dbpath));
});
