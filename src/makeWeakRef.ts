export = makeWeakRef;
import SlowKind = require('./slowKind');
import SlowLog = require('./slowLog');
import storage = require('./storage/storage');


/**
 * Marks the given object as a weak-referenced slow object. WeakRefs are serializable
 * regardless of what they contain, however they are effectively serialized as `null`.
 * Therefore, code using WeakRefs must always check for null before dereferencing them,
 * as they may become null between every tick of the slow event loop, due to the
 * possibility of the process stopping and restarting, and the epoch hence resuming
 * with rehydrated slow objects.
 * @param obj the object to mark as a weak-referenced slow object. It must be an object type.
 */
var makeWeakRef: {
    (obj: any): void;

    /** INTERNAL the SlowLog to which this function is bound. */
    $slowLog: SlowLog;

    /** INTERNAL returns a makeWeakRef function bound to the given SlowLog. */
    logged(log: SlowLog): typeof makeWeakRef;
}


// Define the callable part of makeWeakRef.
makeWeakRef = <any> ((obj: any) => {
    obj.$slow = { kind: SlowKind.WeakRef };
    storage.created(obj);
});


// Set the '$slowLog' property on the makeWeakRef function.
makeWeakRef.$slowLog = SlowLog.none;


// Define the `logged` method on the makeWeakRef function.
makeWeakRef.logged = (log: SlowLog) => {

    // Return the cached constructor if one has already been created.
    var cached = log['_makeWeakRef'];
    if (cached) return cached;

    // Derive a new makeWeakRef function that is bound to the given slow log.
    var makeWeakRefLogged: typeof makeWeakRef = <any> ((obj: any) => {
        obj.$slow = { kind: SlowKind.WeakRef }
        storage.created(obj);
    });
    makeWeakRefLogged.$slowLog = log;
    makeWeakRefLogged.logged = makeWeakRef.logged;

    // Cache and return the function.
    log['_makeWeakRef'] = makeWeakRefLogged;
    return makeWeakRefLogged;
};


// Tell storage how to create a SlowWeakRef instance.
storage.registerSlowObjectFactory(SlowKind.WeakRef, $slow => {
    return null;
});
