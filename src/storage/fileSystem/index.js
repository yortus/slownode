var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var storageLocation = require('./storageLocation');
var serialize = require('../serialize');
// TODO: doc... single process/thread exclusive by design...
// TODO: use proper unique keys when generating keys (GUID? int counter?)
// TODO: errors are not caught... What to do?
var api = { init: init, upsert: upsert, remove: remove, find: find };
function init() {
    // Check if the directory already exists. Use fs.stat since fs.exists is deprecated.
    var dirExists = true;
    try {
        fs.statSync(storageLocation);
    }
    catch (ex) {
        dirExists = false;
    }
    // Resume the current epoch (if dir exists) or start a new epoch (if no dir).
    if (!dirExists) {
        fs.mkdirSync(storageLocation);
    }
}
function upsert(slowObj) {
    var slow = slowObj._slow;
    slow.id = slow.id || newKey();
    var serializedValue = serialize(slowObj);
    var filename = path.join(storageLocation, slow.type + "-" + slow.id + ".json");
    // TODO: temp testing was...
    fs.writeFileSync(filename, serializedValue, { encoding: 'utf8', flag: 'w' });
}
function remove(slowObj) {
    var slow = slowObj._slow;
    var filename = path.join(storageLocation, slow.type + "-" + slow.id + ".json");
    // TODO: temp testing was...
    fs.unlinkSync(filename);
}
// TODO: add `where` param (eg for event loop searching for what it can schedule)
// TODO: cache this one - it could be slow. Should only use at startup time (and event loop??)
function find(type, id) {
    var filenames = fs.readdirSync(storageLocation);
    var filenamePrefix = type + "-" + (id || '');
    filenames = filenames.filter(function (filename) { return filename.indexOf(filenamePrefix) === 0; });
    return [];
    //TODO: fix!... was... var results = filenames.map(filename => deserialize(fs.readFileSync(path.join(storageLocation, filename), { encoding: 'utf8', flag: 'r' })));
    //return results;
}
function newKey() {
    var id = crypto.createHash('sha1').update(crypto.randomBytes(256)).digest('hex').slice(0, 40);
    return id;
}
module.exports = api;
//# sourceMappingURL=index.js.map