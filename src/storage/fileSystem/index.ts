import fs = require('fs');
import path = require('path');
import crypto = require('crypto');
import storageLocation = require('./storageLocation');
import serialize = require('../serialize');
import deserialize = require('../deserialize');
import API = require('../api');
type Key = number|string;
export = api;


// TODO: all DB ops below assume there is a containing Fiber! Doc how to use this properly...
// TODO: errors are not caught... What to do?


var api: API = { init, add, get, set, del, find };


function init() {

    // Check if the directory already exists. Use fs.stat since fs.exists is deprecated.
    var dirExists = true;
    try { fs.statSync(storageLocation); } catch (ex) { dirExists = false; }

    // Resume the current epoch (if dir exists) or start a new epoch (if no dir).
    if (!dirExists) {
        fs.mkdirSync(storageLocation);
    }
}


function add(table: string, value: any, key?: Key): Key {
    var serializedValue = serialize(value);
    key = key || newKey();
    var filename = path.join(storageLocation, `${table}-${key}.json`);
    fs.writeFileSync(filename, serializedValue, { encoding: 'utf8', flag: 'wx' });
    return key;
}


function get(table: string, key: Key): any {
    try {
        var filename = path.join(storageLocation, `${table}-${key}.json`);
        var json = fs.readFileSync(filename, { encoding: 'utf8', flag: 'r' });
        var value = deserialize(json);
        return value;
    }
    catch (ex) {
        return void 0;
    }
}


function set(table: string, key: Key, value: any): void {
    var filename = path.join(storageLocation, `${table}-${key}.json`);
    var serializedValue = serialize(value);
    fs.writeFileSync(filename, serializedValue, { encoding: 'utf8', flag: 'w' });
}


function del(table: string, key: Key) {
    var filename = path.join(storageLocation, `${table}-${key}.json`);
    fs.unlinkSync(filename);
}


// TODO: add `where` param (eg for event loop searching for what it can schedule)
// TODO: cache this one - it could be slow. Should only use at startup time (and event loop??)
function find(table: string) {
    var filenames = fs.readdirSync(storageLocation);
    filenames = filenames.filter(filename => filename.indexOf(table + '-') === 0);
    var results = filenames.map(filename => ({
        id: <Key> extractKey(filename),
        value: deserialize(fs.readFileSync(path.join(storageLocation, filename), { encoding: 'utf8', flag: 'r' }))
    }));
    return results;
}


function newKey(): Key {
    var id: string = crypto.createHash('sha1').update(crypto.randomBytes(256)).digest('hex').slice(0, 40);
    return id;
}


function extractKey(filename: string): Key {
    return filename.slice(-45, -5);
}
