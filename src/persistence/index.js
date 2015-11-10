var assert = require('assert');
var dehydrateSlowObject = require('./dehydrateSlowObject');
// TODO: doc...
function created(slowObj) {
    assert(!allTrackedObjects.has(slowObj));
    ensureSlowObjectHasUniqueId(slowObj);
    allTrackedObjects.add(slowObj);
    updatedTrackedObjects.add(slowObj);
    // TODO: was... console.log('----CREATED ' + this.id + ':' + slowObj.$slow.kind + ':' + slowObj.$slow.id);
}
exports.created = created;
// TODO: doc...
function updated(slowObj) {
    assert(allTrackedObjects.has(slowObj));
    updatedTrackedObjects.add(slowObj);
    // TODO: was... console.log('----UPDATED ' + this.id + ':' + slowObj.$slow.kind + ':' + slowObj.$slow.id);
}
exports.updated = updated;
// TODO: doc...
function deleted(slowObj) {
    assert(allTrackedObjects.has(slowObj));
    deletedTrackedObjects.add(slowObj);
    // TODO: was... console.log('----DELETED ' + this.id + ':' + slowObj.$slow.kind + ':' + slowObj.$slow.id);
}
exports.deleted = deleted;
// TODO: doc...
function flush() {
    // TODO: implement...
    if (updatedTrackedObjects.size > 0 || deletedTrackedObjects.size > 0) {
        // TODO: implement...
        //updatedTrackedObjects.clear();
        //deletedTrackedObjects.clear();
        // TODO: ========================================== SUPER INEFFICIENT APPROACH... =============================================
        // For each deleted object, mark it as deleted in the log, and remove it from the set of tracked objects.
        deletedTrackedObjects.forEach(function (obj) {
            log("[\"" + obj.$slow.id + "\", null],\n\n\n");
            allTrackedObjects.delete(obj);
        });
        // For each updated object, dehydrate it and write its serialized form to the log.
        updatedTrackedObjects.forEach(function (obj) {
            var jsonSafe = dehydrateSlowObject(obj, allTrackedObjects);
            log("[\"" + obj.$slow.id + "\", " + JSON.stringify(jsonSafe) + "],\n\n\n");
        });
        // Clear the deleted and updated sets.
        deletedTrackedObjects.clear();
        updatedTrackedObjects.clear();
    }
    return Promise.resolve(null);
}
exports.flush = flush;
// TODO: doc...
function fetch() {
    // TODO: implement...
    throw new Error('Not implemented');
}
exports.fetch = fetch;
// TODO: doc...
function howToRehydrate(slowKind, rehydrate) {
    rehydrators[slowKind] = rehydrate;
}
exports.howToRehydrate = howToRehydrate;
// TODO: temp testing...
var rehydrators = {};
// TODO: temp testing...
function ensureSlowObjectHasUniqueId(obj) {
    obj.$slow.id = obj.$slow.id || "#" + ++nextId;
}
// TODO: temp testing...
var allTrackedObjects = new Set();
var updatedTrackedObjects = new Set();
var deletedTrackedObjects = new Set();
var nextId = 0;
function log(s) {
    console.log(s);
    // TODO: ...
    //init();
    //(<any>fs.writeSync)(logFileDescriptor, s, null, 'utf8');
    //fs.fsyncSync(logFileDescriptor);
}
//var init = () => {
//    // Ensure init is only performed once.
//    // TODO: this is a bit hacky... better way?
//    init = () => {};
//    //var fileExists = exists();
//    // Resume the current epoch (if file exists) or start a new epoch (if no file).
//    // TODO: fix ...
//    logFileDescriptor = fs.openSync(storageLocation, 'a'); // TODO: ensure this file gets closed eventually!!!
//    //TODO: NEEDED!:   fs.flockSync(logFileDescriptor, 'ex'); // TODO: ensure exclusion. HANDLE EXCEPTIONS HERE! ALSO: THIS LOCK MUST BE EXPLICITLY REMOVED AFTER FINISHED!
//};
//# sourceMappingURL=index.js.map