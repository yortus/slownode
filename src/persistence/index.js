var assert = require('assert');
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
        console.log('FLUSH!!!');
        updatedTrackedObjects.clear();
        deletedTrackedObjects.clear();
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
    obj.$slow.id = obj.$slow.id || "#" + ++this.nextId;
}
// TODO: temp testing...
var allTrackedObjects = new Set();
var updatedTrackedObjects = new Set();
var deletedTrackedObjects = new Set();
var nextId = 0;
//# sourceMappingURL=index.js.map