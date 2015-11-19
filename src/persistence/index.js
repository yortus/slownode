var assert = require('assert');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var storageLocation = require('./storageLocation');
var dehydrateSlowObject = require('./dehydrateSlowObject');
var Knex = require('knex');
/** Begins tracking the specified object. */
function created(slowObj) {
    //TODO:...
    console.log("CREATED   epoch:" + slowObj.$slow.epochId + "   kind:" + slowObj.$slow.kind + "   id:" + slowObj.$slow.id);
    assert(!trackedObjects.has(slowObj));
    assert(!weakReferences.has(slowObj));
    trackedObjects.add(slowObj);
    pendingCreates.add(slowObj);
}
exports.created = created;
/** Records that the tracked object has changed state. */
function updated(slowObj) {
    //TODO:...
    console.log("UPDATED   epoch:" + slowObj.$slow.epochId + "   kind:" + slowObj.$slow.kind + "   id:" + slowObj.$slow.id);
    assert(trackedObjects.has(slowObj));
    assert(!weakReferences.has(slowObj));
    if (!pendingCreates.has(slowObj)) {
        pendingUpdates.add(slowObj);
    }
}
exports.updated = updated;
/** Records that the tracked object is no longer referenced. */
function deleted(slowObj) {
    //TODO:...
    console.log("DELETED   epoch:" + slowObj.$slow.epochId + "   kind:" + slowObj.$slow.kind + "   id:" + slowObj.$slow.id);
    assert(trackedObjects.has(slowObj));
    assert(!weakReferences.has(slowObj));
    if (pendingCreates.has(slowObj)) {
        trackedObjects.delete(slowObj);
        pendingCreates.delete(slowObj);
    }
    else {
        pendingUpdates.delete(slowObj);
        pendingDeletes.add(slowObj);
    }
}
exports.deleted = deleted;
/** TODO: doc weak references... Marks the object as a weak reference. */
function weakRef(obj) {
    weakReferences.add(obj);
}
exports.weakRef = weakRef;
/** Commits the current state of all tracked objects to persistent storage. */
exports.flush = async(function () {
    //TODO:...
    console.log("FLUSH...");
    // Return immediately if there are no pending changes.
    if (pendingCreates.size === 0 && pendingUpdates.size === 0 && pendingDeletes.size === 0)
        return;
    // Get database connection.
    // TODO: use transaction?
    var knex = await(connect());
    // Process each pending change appropriately.
    pendingCreates.forEach(function (obj) {
        obj.$slow.id = obj.$slow.id || "#" + ++nextId; // Ensure object has a unique id.
        var json = JSON.stringify(dehydrateSlowObject(obj, trackedObjects, weakReferences));
        await(knex.table('Entry').insert({
            kind: obj.$slow.kind,
            epochId: obj.$slow.epochId,
            id: obj.$slow.id,
            json: json
        }));
    });
    pendingUpdates.forEach(function (obj) {
        var json = JSON.stringify(dehydrateSlowObject(obj, trackedObjects, weakReferences));
        await(knex.table('Entry').where('id', obj.$slow.id).update({ json: json }));
    });
    pendingDeletes.forEach(function (obj) {
        await(knex.table('Entry').delete().where('id', obj.$slow.id));
        trackedObjects.delete(obj);
    });
    // Clear all pending changes.
    pendingCreates.clear();
    pendingUpdates.clear();
    pendingDeletes.clear();
});
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
exports.disconnect = async(function () {
    var knex = await(connect());
    await(knex.destroy());
    connect['knex'] = null;
});
// TODO: temp testing...
var rehydrators = {};
// TODO: temp testing...
var trackedObjects = new Set();
var pendingCreates = new Set();
var pendingUpdates = new Set();
var pendingDeletes = new Set();
var weakReferences = new WeakSet();
var nextId = 0;
// TODO: temp testing...
var connect = async(function () {
    // TODO: caching...
    var knex = connect['knex'];
    if (knex)
        return knex;
    // TODO: ...
    var knex = connect['knex'] = Knex({
        client: "sqlite3",
        connection: {
            filename: storageLocation
        }
    });
    await(knex.schema.createTableIfNotExists('Entry', function (table) {
        table.string('id').primary().notNullable();
        table.integer('kind').notNullable();
        table.string('epochId').notNullable();
        table.string('json');
    }));
    return knex;
});
//# sourceMappingURL=index.js.map