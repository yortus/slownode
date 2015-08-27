import fs = require('fs');
import path = require('path');
import crypto = require('crypto');
import storageLocation = require('./storageLocation');
import serialize = require('../serialize');
import deserialize = require('../deserialize');
import API = require('../api');
export = api;


// TODO: errors are not caught... What to do?


var api: API = { init, insert, upsert, update, remove, find };


function init() {

    // Check if the directory already exists. Use fs.stat since fs.exists is deprecated.
    var dirExists = true;
    try { fs.statSync(storageLocation); } catch (ex) { dirExists = false; }

    // Resume the current epoch (if dir exists) or start a new epoch (if no dir).
    if (!dirExists) {
        fs.mkdirSync(storageLocation);
    }
}


function insert(record: API.Record) {
    var serializedValue = serialize(record);
    record.id = record.id || newKey();
    var filename = path.join(storageLocation, `${record.type}-${record.id}.json`);
    fs.writeFileSync(filename, serializedValue, { encoding: 'utf8', flag: 'wx' });
}


function upsert(record: API.Record) {
    var serializedValue = serialize(record);
    record.id = record.id || newKey();
    var filename = path.join(storageLocation, `${record.type}-${record.id}.json`);
    fs.writeFileSync(filename, serializedValue, { encoding: 'utf8', flag: 'w' });
}


function update(record: API.Record) {
    var serializedValue = serialize(record);
    var filename = path.join(storageLocation, `${record.type}-${record.id}.json`);
    if (!fs.existsSync(filename)) throw new Error('update: record does not exist');
    fs.writeFileSync(filename, serializedValue, { encoding: 'utf8', flag: 'w' });
}


function remove(record: API.Record) {
    var filename = path.join(storageLocation, `${record.type}-${record.id}.json`);
    fs.unlinkSync(filename);
}


// TODO: add `where` param (eg for event loop searching for what it can schedule)
// TODO: cache this one - it could be slow. Should only use at startup time (and event loop??)
function find(record: API.Record): API.Record[] {
    var filenames = fs.readdirSync(storageLocation);
    var filenamePrefix = `${record.type}-${record.id || ''}`;
    filenames = filenames.filter(filename => filename.indexOf(filenamePrefix) === 0);
    var results = filenames.map(filename => deserialize(fs.readFileSync(path.join(storageLocation, filename), { encoding: 'utf8', flag: 'r' })));
    return results;
}


function newKey(): API.Key {
    var id: string = crypto.createHash('sha1').update(crypto.randomBytes(256)).digest('hex').slice(0, 40);
    return id;
}
