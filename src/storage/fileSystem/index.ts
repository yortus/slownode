import fs = require('fs');
import path = require('path');
import crypto = require('crypto');
import storageLocation = require('./storageLocation');
import serialize = require('../serialize');
import deserialize = require('../deserialize');
import API = require('../api');
export = api;


// TODO: doc... single process/thread exclusive by design...
// TODO: use proper unique keys when generating keys (GUID? int counter?)
// TODO: errors are not caught... What to do?


var api: API = { init, upsert, remove, find };


function init() {

    // Check if the directory already exists. Use fs.stat since fs.exists is deprecated.
    var dirExists = true;
    try { fs.statSync(storageLocation); } catch (ex) { dirExists = false; }

    // Resume the current epoch (if dir exists) or start a new epoch (if no dir).
    if (!dirExists) {
        fs.mkdirSync(storageLocation);
    }
}


function upsert(slowObj: API.SlowObject) {
    var slow = slowObj._slow;
    slow.id = slow.id || newKey();
    var serializedValue = serialize(slowObj);
    var filename = path.join(storageLocation, `${slow.type}-${slow.id}.json`);
    // TODO: temp testing was...
    fs.writeFileSync(filename, serializedValue, { encoding: 'utf8', flag: 'w' });
}


function remove(slowObj: API.SlowObject) {
    var slow = slowObj._slow;
    var filename = path.join(storageLocation, `${slow.type}-${slow.id}.json`);
    // TODO: temp testing was...
    fs.unlinkSync(filename);
}


// TODO: add `where` param (eg for event loop searching for what it can schedule)
// TODO: cache this one - it could be slow. Should only use at startup time (and event loop??)
function find(type: string, id?: string|number): any[] {
    var filenames = fs.readdirSync(storageLocation);
    var filenamePrefix = `${type}-${id || ''}`;
    filenames = filenames.filter(filename => filename.indexOf(filenamePrefix) === 0);
    return [];
    //TODO: fix!... was... var results = filenames.map(filename => deserialize(fs.readFileSync(path.join(storageLocation, filename), { encoding: 'utf8', flag: 'r' })));
    //return results;
}


function newKey(): string|number {
    var id: string = crypto.createHash('sha1').update(crypto.randomBytes(256)).digest('hex').slice(0, 40);
    return id;
}
