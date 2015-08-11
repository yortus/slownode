import fs = require("fs");
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import Promise = require("bluebird");
import dbpath = require('../dbpath');
var stat = Promise.promisify(fs.stat);
export = dbexists;


var dbexists = async(() => {

    // If the file does not exist, there is nothing to do so just return normally.
    try {
        await(stat(dbpath));
        return true;
    }
    catch (ex) {
        return false;
    }
});
