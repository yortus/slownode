import assert = require('assert');
import SlowKind = require('../slowKind');
import SlowObject = require('../slowObject');
import storageLocation = require('./storageLocation');
import dehydrateSlowObject = require('./dehydrateSlowObject');


// TODO: doc...
export function created(slowObj: SlowObject) {
    assert(!allTrackedObjects.has(slowObj));
    ensureSlowObjectHasUniqueId(slowObj);
    allTrackedObjects.add(slowObj);
    updatedTrackedObjects.add(slowObj);
    // TODO: was... console.log('----CREATED ' + this.id + ':' + slowObj.$slow.kind + ':' + slowObj.$slow.id);
}


// TODO: doc...
export function updated(slowObj: SlowObject) {
    assert(allTrackedObjects.has(slowObj));
    updatedTrackedObjects.add(slowObj);
    // TODO: was... console.log('----UPDATED ' + this.id + ':' + slowObj.$slow.kind + ':' + slowObj.$slow.id);
}


// TODO: doc...
export function deleted(slowObj: SlowObject) {
    assert(allTrackedObjects.has(slowObj));
    deletedTrackedObjects.add(slowObj);
    // TODO: was... console.log('----DELETED ' + this.id + ':' + slowObj.$slow.kind + ':' + slowObj.$slow.id);
}


// TODO: doc...
export function flush(): Promise<void> {

    // TODO: implement...
    if (updatedTrackedObjects.size > 0 || deletedTrackedObjects.size > 0) {

        // TODO: implement...
        //updatedTrackedObjects.clear();
        //deletedTrackedObjects.clear();


        // TODO: ========================================== SUPER INEFFICIENT APPROACH... =============================================

        // For each deleted object, mark it as deleted in the log, and remove it from the set of tracked objects.
        deletedTrackedObjects.forEach(obj => {
            log(`["${obj.$slow.id}", null],\n\n\n`);
            allTrackedObjects.delete(obj);
        });

        // For each updated object, dehydrate it and write its serialized form to the log.
        updatedTrackedObjects.forEach(obj => {
            var jsonSafe = dehydrateSlowObject(obj, allTrackedObjects);
            log(`["${obj.$slow.id}", ${JSON.stringify(jsonSafe)}],\n\n\n`);
        });

        // Clear the deleted and updated sets.
        deletedTrackedObjects.clear();
        updatedTrackedObjects.clear();


    }
    return Promise.resolve(null);
}


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
var rehydrators: { [type: number]: RehydrateFunction; } = {};
type RehydrateFunction = ($slow: { kind: SlowKind; epochId: string; id: string; [other: string]: any; }) => SlowObject;


// TODO: temp testing...
function ensureSlowObjectHasUniqueId(obj: SlowObject) {
    obj.$slow.id = obj.$slow.id || `#${++nextId}`;
}



// TODO: temp testing...
var allTrackedObjects = new Set<SlowObject>();
var updatedTrackedObjects = new Set<SlowObject>();
var deletedTrackedObjects = new Set<SlowObject>();
var nextId = 0;





function log(s: string) {
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
