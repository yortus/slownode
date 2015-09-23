import SlowObject = require('../slowObject');
import storage = require('./storage');
export = SlowLog;


var SlowLog = {
    created: (...objs: SlowObject[]) => objs.forEach(storage.created),
    updated: (...objs: SlowObject[]) => objs.forEach(storage.updated),
    deleted: (...objs: SlowObject[]) => objs.forEach(storage.deleted)
};
