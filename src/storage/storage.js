var fs = require('fs');
var path = require('path');
var storageLocation = require('./storageLocation');
var serialize = require('./serialize');
// TODO: doc... single process/thread exclusive by design...
// TODO: use proper unique keys when generating keys (GUID? int counter?)
// TODO: errors are not caught... What to do?
// TODO: NB from linux manpage: Calling fsync() does not necessarily ensure that the entry in the directory containing the file has also reached disk. For that an explicit fsync() on a file descriptor for the directory is also needed.
// TODO: doc... this works due to exclusive process requirement.
var idCounter = 0;
var api = { init: init, upsert: upsert, remove: remove, find: find };
// TODO: temp testing...
var logFileDescriptor;
function init() {
    // Check if the logFile already exists. Use fs.stat since fs.exists is deprecated.
    var fileExists = true;
    try {
        fs.statSync(storageLocation);
    }
    catch (ex) {
        fileExists = false;
    }
    if (fileExists) {
        fs.unlinkSync(storageLocation);
    }
    // Resume the current epoch (if file exists) or start a new epoch (if no file).
    // TODO: fix ...
    logFileDescriptor = fs.openSync(storageLocation, 'a'); // TODO: ensure this file gets closed eventually!!!
    //TODO: NEEDED!:   fs.flockSync(logFileDescriptor, 'ex'); // TODO: ensure exclusion. HANDLE EXCEPTIONS HERE! ALSO: THIS LOCK MUST BE EXPLICITLY REMOVED AFTER FINISHED!
    //if (fileExists) {
    //    logFileDescriptor = fs.openSync(storageLocation, 'ax');
    //}
    //else {
    //    logFileDescriptor = fs.openSync(storageLocation, 'ax');
    //}
    fs.writeSync(logFileDescriptor, "'BEGIN'", null, 'utf8');
    fs.fsyncSync(logFileDescriptor);
}
function upsert(slowObj) {
    var slow = slowObj._slow;
    slow.id = slow.id || "#" + ++idCounter;
    var serializedValue = serialize(slowObj);
    var filename = path.join(storageLocation, slow.id + "-" + slow.type + ".json");
    // TODO: testing... NB node.d.ts is missing a typing here...
    fs.writeSync(logFileDescriptor, ",\n\n\n'UPSERT',\n" + serializedValue, null, 'utf8');
    fs.fsyncSync(logFileDescriptor);
}
function remove(slowObj) {
    var slow = slowObj._slow;
    var filename = path.join(storageLocation, slow.id + "-" + slow.type + ".json");
    // TODO: testing...
    fs.writeSync(logFileDescriptor, ",\n\n\n'DELETE " + slow.type + " " + slow.id + "'", null, 'utf8');
    fs.fsyncSync(logFileDescriptor);
}
// TODO: add `where` param (eg for event loop searching for what it can schedule)
// TODO: cache this one - it could be slow. Should only use at startup time (and event loop??)
function find(type, id) {
    //var filenames = fs.readdirSync(storageLocation);
    //var filenamePrefix = `${id || ''}-${type}`;
    //filenames = filenames.filter(filename => filename.indexOf(filenamePrefix) === 0);
    return [];
    //TODO: fix!... was... var results = filenames.map(filename => deserialize(fs.readFileSync(path.join(storageLocation, filename), { encoding: 'utf8', flag: 'r' })));
    //return results;
}
module.exports = api;
//# sourceMappingURL=storage.js.map