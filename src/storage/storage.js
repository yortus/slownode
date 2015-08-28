var assert = require('assert');
var fs = require('fs');
var storageLocation = require('./storageLocation');
var dehydrate = require('./dehydrate');
var rehydrate = require('./rehydrate');
// TODO: doc... single process/thread exclusive by design...
// TODO: errors are not caught... What to do?
// TODO: NB from linux manpage: Calling fsync() does not necessarily ensure that the entry in the directory containing the file has also reached disk. For that an explicit fsync() on a file descriptor for the directory is also needed.
// TODO: doc... this works due to exclusive process requirement.
// TODO: but how to ensure no clashes with client-supplied ids? doc client-supplied id restrictions in API...
var idCounter = 0;
var api = { registerSlowType: registerSlowType, init: init, upsert: upsert, remove: remove };
// TODO: temp testing...
var logFileDescriptor;
var cache = {};
// TODO: temp testing...
function registerSlowType(registration) {
    // TODO: ...
}
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
        // TODO: replay log file, then truncate it
        replayLog();
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
    fs.writeSync(logFileDescriptor, "\"BEGIN\"", null, 'utf8');
    fs.fsyncSync(logFileDescriptor);
}
function upsert(slowObj) {
    var slow = slowObj._slow;
    slow.id = slow.id || "#" + ++idCounter;
    var serializedValue = JSON.stringify(dehydrate(slowObj));
    cache[(slow.id + "-" + slow.type)] = slowObj;
    // TODO: testing... NB node.d.ts is missing a typing here...
    fs.writeSync(logFileDescriptor, ",\n\n\n\"UPSERT\",\n" + serializedValue, null, 'utf8');
    fs.fsyncSync(logFileDescriptor);
}
function remove(slowObj) {
    var slow = slowObj._slow;
    delete cache[(slow.id + "-" + slow.type)];
    // TODO: testing...
    fs.writeSync(logFileDescriptor, ",\n\n\n\"REMOVE\",\n\"" + slow.id + "-" + slow.type + "\"", null, 'utf8');
    fs.fsyncSync(logFileDescriptor);
}
function replayLog() {
    var json = '[' + fs.readFileSync(storageLocation, 'utf8') + ']';
    var logEntries = JSON.parse(json);
    var pos = 1;
    while (pos < logEntries.length) {
        var command = logEntries[pos++];
        var details = logEntries[pos++];
        switch (command) {
            case 'UPSERT':
                assert(details.$type === 'SlowDef');
                var slow = details.value;
                var key = slow.id + "-" + slow.type;
                // TODO: deserialize!!!!!!!!
                var value = rehydrate(details);
                cache[key] = value;
                break;
            case 'REMOVE':
                key = details;
                delete cache[key];
                break;
            default:
                throw new Error("Unrecognised log entry command '" + command + "'");
        }
    }
}
module.exports = api;
//# sourceMappingURL=storage.js.map