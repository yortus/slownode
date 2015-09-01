var fs = require('fs');
var storageLocation = require('./storageLocation');
var dehydrate = require('./dehydrate');
var rehydrate = require('./rehydrate');
var typeRegistry = require('./typeRegistry');
// TODO: doc... single process/thread exclusive by design...
// TODO: errors are not caught... What to do?
// TODO: NB from linux manpage: Calling fsync() does not necessarily ensure that the entry in the directory containing the file has also reached disk. For that an explicit fsync() on a file descriptor for the directory is also needed.
// TODO: doc... this works due to exclusive process requirement.
// TODO: but how to ensure no clashes with client-supplied ids? doc client-supplied id restrictions in API...
var idCounter = 0;
// TODO: temp testing...
var logFileDescriptor;
var cache = {};
// TODO: temp testing...
function registerType(registration) {
    typeRegistry.store(registration);
}
exports.registerType = registerType;
// TODO: temp testing...
function lookup(slowObj) {
    return cache[makeKey(slowObj._slow)];
}
exports.lookup = lookup;
var init = function () {
    // Ensure init is only performed once.
    // TODO: this is a bit hacky... better way?
    init = function () { };
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
};
function upsert(slowObj) {
    init();
    var slow = slowObj._slow;
    slow.id = slow.id || "#" + ++idCounter;
    var key = makeKey(slow);
    var serializedValue = JSON.stringify(dehydrate(slowObj));
    cache[("" + key)] = slowObj;
    // TODO: testing... NB node.d.ts is missing a typing here...
    try {
        fs.writeSync(logFileDescriptor, ",\n\n\n\"" + key + "\", " + serializedValue, null, 'utf8');
        fs.fsyncSync(logFileDescriptor);
    }
    catch (ex) {
        console.log('FILE DESCRIPTOR: ' + logFileDescriptor);
        throw ex;
    }
}
exports.upsert = upsert;
function remove(slowObj) {
    init();
    var slow = slowObj._slow;
    var key = makeKey(slow);
    delete cache[key];
    // TODO: testing...
    fs.writeSync(logFileDescriptor, ",\n\n\n\"" + key + "\", null", null, 'utf8');
    fs.fsyncSync(logFileDescriptor);
}
exports.remove = remove;
function replayLog() {
    var json = '[' + fs.readFileSync(storageLocation, 'utf8') + ']';
    var logEntries = JSON.parse(json);
    var pos = 1;
    var keyOrder = [];
    // TODO: only rehydrate the LAST upsert/delete encountered for each key
    while (pos < logEntries.length) {
        var key = logEntries[pos++];
        var jsonSafeValue = logEntries[pos++];
        if (!(key in cache))
            keyOrder.push(key);
        cache[key] = jsonSafeValue;
    }
    keyOrder.forEach(function (key) {
        if (cache[key] === null) {
            delete cache[key];
        }
        else {
            // TODO: important - relies on defs before refs!
            cache[key] = rehydrate(cache[key], function (slow) { return cache[makeKey(slow)]; });
        }
    });
}
// TODO: doc...
function makeKey(slow) {
    return slow.id + "-" + slow.type;
}
//# sourceMappingURL=storage.js.map