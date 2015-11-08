import assert = require('assert');
import SlowKind = require('../slowKind');
import SlowObject = require('../slowObject');
import storageLocation = require('./storageLocation');


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
    console.log('FLUSH!!!');
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
    obj.$slow.id = obj.$slow.id || `#${++this.nextId}`;
}



// TODO: temp testing...
var allTrackedObjects = new Set<SlowObject>();
var updatedTrackedObjects = new Set<SlowObject>();
var deletedTrackedObjects = new Set<SlowObject>();
var nextId = 0;
