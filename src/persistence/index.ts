import assert = require('assert');
import vm = require('vm');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import SlowKind = require('../slowKind');
import SlowObject = require('../slowObject');
import storageLocation = require('./storageLocation');
import dehydrateSlowObject = require('./dehydrateSlowObject');
import Knex = require('knex');


/** Begins tracking the specified object. */
export function created(slowObj: SlowObject) {
//TODO:...
console.log(`CREATED   epoch:${slowObj.$slow.epochId}   kind:${slowObj.$slow.kind}   id:${slowObj.$slow.id}`); 
    assert(!trackedObjects.has(slowObj));
    assert(!weakReferences.has(slowObj));
    trackedObjects.add(slowObj);
    pendingCreates.add(slowObj);
}


/** Records that the tracked object has changed state. */
export function updated(slowObj: SlowObject) {
//TODO:...
console.log(`UPDATED   epoch:${slowObj.$slow.epochId}   kind:${slowObj.$slow.kind}   id:${slowObj.$slow.id}`); 
    assert(trackedObjects.has(slowObj));
    assert(!weakReferences.has(slowObj));
    if (!pendingCreates.has(slowObj)) {
        pendingUpdates.add(slowObj);
    }
}

/** Records that the tracked object is no longer referenced. */
export function deleted(slowObj: SlowObject) {
//TODO:...
console.log(`DELETED   epoch:${slowObj.$slow.epochId}   kind:${slowObj.$slow.kind}   id:${slowObj.$slow.id}`); 
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

/** TODO: doc weak references... Marks the object as a weak reference. */
export function weakRef(obj: any) {
    weakReferences.add(obj);
}


/** Commits the current state of all tracked objects to persistent storage. */
export var flush = async (() => {
//TODO:...
console.log(`FLUSH...`); 

    // Return immediately if there are no pending changes.
    if (pendingCreates.size === 0 && pendingUpdates.size === 0 && pendingDeletes.size === 0) return;

    // Get database connection.
    // TODO: use transaction?
    var knex = await (connect());

    // Process each pending change appropriately.
    pendingCreates.forEach(obj => {
        obj.$slow.id = obj.$slow.id || `#${++nextId}`; // Ensure object has a unique id.
        var json = JSON.stringify(dehydrateSlowObject(obj, trackedObjects, weakReferences));
        await (knex.table('Entry').insert({
            kind: obj.$slow.kind,
            epochId: obj.$slow.epochId,
            id: obj.$slow.id,
            json: json
        }));
    });
    pendingUpdates.forEach(obj => {
        var json = JSON.stringify(dehydrateSlowObject(obj, trackedObjects, weakReferences));
        await (knex.table('Entry').where('id', obj.$slow.id).update({ json: json }));
    });
    pendingDeletes.forEach(obj => {
        await (knex.table('Entry').delete().where('id', obj.$slow.id));
        trackedObjects.delete(obj);
    });

    // Clear all pending changes.
    pendingCreates.clear();
    pendingUpdates.clear();
    pendingDeletes.clear();
});


// TODO: doc...
export function fetch(): Promise<void> {
    // TODO: implement...
    throw new Error('Not implemented');
}


// TODO: doc...
export function howToRehydrate(slowKind: SlowKind, rehydrate: RehydrateFunction) {
    rehydrators[slowKind] = rehydrate;
}


// TODO: temp testing...
export var disconnect = async (() => {
    var knex = await (connect());
    await (knex.destroy());
    connect['knex'] = null;
});





// TODO: temp testing...
var rehydrators: { [type: number]: RehydrateFunction; } = {};
type RehydrateFunction = ($slow: { kind: SlowKind; epochId: string; id: string; [other: string]: any; }, epoch: vm.Context) => SlowObject;





// TODO: temp testing...
var trackedObjects = new Set<SlowObject>();
var pendingCreates = new Set<SlowObject>();
var pendingUpdates = new Set<SlowObject>();
var pendingDeletes = new Set<SlowObject>();
var weakReferences = new WeakSet<Object>();
var nextId = 0;





// TODO: temp testing...
var connect = async (() => {

    // TODO: caching...
    var knex: Knex = connect['knex'];
    if (knex) return knex;

    // TODO: ...
    var knex = connect['knex'] = Knex({
        client: "sqlite3",
        connection: {
            filename: storageLocation
        }
    });

    await (knex.schema.createTableIfNotExists('Entry', table => {
        table.string('id').primary().notNullable();
        table.integer('kind').notNullable();
        table.string('epochId').notNullable();
        table.string('json');
    }));

    return knex;
});
