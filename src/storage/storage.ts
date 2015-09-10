import assert = require('assert');
import fs = require('fs');
import path = require('path');
import crypto = require('crypto');
import _ = require('lodash');
import types = require('types');
import SlowObject = types.SlowObject;
import storageLocation = require('./storageLocation');
import dehydrate = require('./dehydrate');
import rehydrate = require('./rehydrate');
import typeRegistry = require('./typeRegistry');



namespace newImprovedApi {


    // Tracking control (all synchronous)
    export function created(obj: SlowObject): void {return null;}
    export function updated(obj: SlowObject): void {return null;}
    export function deleted(obj: SlowObject): void {return null;}

    // Serialization control (if synchronous)
    export function saveStateSync(): void {}
    export function loadStateSync(): void {}

    // Serialization control (if asynchronous)
    export function saveState(callback: (err?) => void) {}
    export function loadState(callback: (err?) => void) {}

    // Slow object type registration
    export function registerSlowType(typeInfo: SlowTypeInfo) {}
    interface SlowTypeInfo {
        name: string;
        createBlank: () => SlowObject;
        getState: (obj: SlowObject) => any;
        setState: (obj: SlowObject, value: any) => void;
    }

    // Internals...
    var trackedObjects: SlowObject[];
    var registry: any; //???
}


export function created(...objects: SlowObject[]): void {
    objects.forEach(obj => {
        assert(!allTrackedObjects.has(obj));

        // Ensure it has a unique ID
        obj._slow.id = obj._slow.id || `#${++nextId}`;

        allTrackedObjects.add(obj);
        updatedTrackedObjects.add(obj);
    });
}


export function updated(...objects: SlowObject[]): void {
    objects.forEach(obj => {
        assert(allTrackedObjects.has(obj));
        updatedTrackedObjects.add(obj);
    });
}


export function deleted(...objects: SlowObject[]): void {
    objects.forEach(obj => {
        assert(allTrackedObjects.has(obj));
        deletedTrackedObjects.add(obj);
    });
}


var allTrackedObjects = new Set<SlowObject>();
var updatedTrackedObjects = new Set<SlowObject>();
var deletedTrackedObjects = new Set<SlowObject>();
var nextId = 0;
var isLoadingState = false;


export function saveState(callback?: (err?) => void) {

    // STEPS:
    // - for all deleted objects:
    //   - mark deleted in log
    //   - remove from tracked objects list

    // - for all updated objects: dehydrate and write to log
    //   - dehydrate: traverse object; for each element/value:
    //     - if it is on the tracked objects list, dehydrate as a $ref
    //     - if it is on the deleted objects list - ?! is that an error? It shouldn't have any references to it
    //     - otherwise - do normal/extended JSON serialization

    // - clear the deleted objects list
    // - clear the updated objects list

    // TODO: ...
    setImmediate(() => {
        log(`======================================== SAVE STATE ========================================`);

// TODO: temp testing for DEBUGGING only...
//var debug = {
//    all: setToArray(allTrackedObjects),
//    deleted: setToArray(deletedTrackedObjects),
//    updated: setToArray(updatedTrackedObjects)
//}

        // TODO: Step 1
        deletedTrackedObjects.forEach(obj => {
            log(`DELETE: ${obj._slow.id}`);
            allTrackedObjects.delete(obj);
        });

        // TODO: Step 2
        updatedTrackedObjects.forEach(obj => {
            var json = dehydrate(obj, allTrackedObjects);
            log(`UPSERT: ${JSON.stringify(json)}`);
        });

        // TODO: Step 3
        deletedTrackedObjects.clear();
        updatedTrackedObjects.clear();

        // TODO: Done. But catch errors!!!
        if (callback) callback();
    });
}

export function loadState() {

    // STEPS:
    // - set isLoadingState, so tracking calls are ignored.
    // - read the entire log into a biiiig array/hash
    // - full tracked objects list EQUALS all updated objects
    //                             MINUS  all deleted objects (can be further pruned to only refd objects later)
    //                             MINUS  all tracked objects with no $refs to them
    // - for each tracked object:
    //   - ???
    // - clear isLoadingState, so tracking calls are reinstated.

    // TODO: why not just allow tracking always? As load time that will effectively get the next log into the proper state....
    isLoadingState = true;
    // TODO: ...
    isLoadingState = false;




}


function log(s: string) {
    console.log(s);
}

// TODO: temp testing for DEBUGGING only...
function setToArray<T>(s: Set<T>): T[] {
    var result = [];
    s.forEach(el => result.push(el));
    return result;
}








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
//export function registerType(registration: types.SlowObject.Registration) {
//    typeRegistry.store(registration);
//}


// TODO: temp testing...
//export function lookup(slowObj: types.SlowObject): types.SlowObject {
//    return cache[slowObj._slow.id];
//}


// TODO: doc...
//export function track(slowObj: types.SlowObject) {
//    init();

//    var slow = slowObj._slow;
//    slow.id = slow.id || `#${++idCounter}`;
//    var key = slow.id;
//    var serializedValue = JSON.stringify(dehydrateDef(slowObj));
//    cache[`${key}`] = slowObj;

//    // TODO: testing... NB node.d.ts is missing a typing here...
//    try {
//        (<any>fs.writeSync)(logFileDescriptor, `,\n\n\n"${key}", ${serializedValue}`, null, 'utf8');
//        fs.fsyncSync(logFileDescriptor);
//    }
//    catch (ex) {
//        console.log('FILE DESCRIPTOR: ' + logFileDescriptor);
//        throw ex;
//    }
//}


// TODO: doc...
//export function clear(slowObj: types.SlowObject) {
//    init();

//    var slow = slowObj._slow;
//    var key = slow.id;
//    delete cache[key];

//    // TODO: testing...
//    (<any>fs.writeSync)(logFileDescriptor, `,\n\n\n"${key}", null`, null, 'utf8');
//    fs.fsyncSync(logFileDescriptor);
//}






// TODO: temp testing...
//var registrations: types.SlowObject.Registration[];
//function dehydrateDef(value: any) {
//    registrations = registrations || typeRegistry.fetchAll();

//    var jsonSafeValue;
//    for (var i = 0; jsonSafeValue === void 0 && i < registrations.length; ++i) {
//        var reg = registrations[i];
//        jsonSafeValue = reg.dehydrate(value, dehydrate);
//    }
//    return jsonSafeValue;
//}


//function rehydrateDef(jsonSafeValue: any) {




//    var slow: { type; id; } = <any> {};
//    _.keys(jsonSafeValue).forEach(propName => {
//        var propValue = jsonSafeValue[propName];
//        //if (propValue && propValue.$ref) {
//        //    Object.defineProperty(slow, propName, {
//        //        get: () => cache[propValue.$ref]
//        //    });
//        //}
//        //else {
//            slow[propName] = rehydrate(propValue);
//        //}
//    });
//    var rehydrateSlowObject = typeRegistry.fetch(slow.type).rehydrate;
//    var result = rehydrateSlowObject(slow);
//    return result;
//}





//// TODO: must support circular refs between SlowObjects when rehydrating them!
//function replayLog() {


//    var json = '[' + fs.readFileSync(storageLocation, 'utf8') + ']';
//    var logEntries: any[] = JSON.parse(json);
//    var pos = 1;
//    var keyOrder = [];


//    while (pos < logEntries.length) {
//        var key: string = logEntries[pos++];
//        var jsonSafeValue: any = logEntries[pos++];

//        if (!(key in cache)) keyOrder.push(key);
//        cache[key] = jsonSafeValue;
//    }


//    //........
//    traverseJsonSafeObject(cache, (obj, key) => {
//        if (key === '$ref') {
//            console.log(`{ $ref: ${obj[key]}}`);
//            var val = obj[key];
//            delete obj[key];
//            Object.defineProperty(obj, key, {
//                get: () => cache[val]
//            });
//        }
//    });


//    keyOrder.forEach(key => {
//        if (cache[key] === null) {
//            delete cache[key];
//        }
//        else {
//            // TODO: important - relies on defs before refs!
//            var slowObj: types.SlowObject = rehydrateDef(cache[key]);
//            cache[key] = slowObj;
//        }
//    });
//}





//// TODO: temp testing...
//function traverseJsonSafeObject(value, action: (obj: any, key: string) => any) {
//    if (_.isPlainObject(value) || _.isArray(value)) {
//        //TODO:...
//        _.forEach(value, (val, key, obj) => {
//            var result = action(obj, key);
//            if (result === false) return;
//            traverseJsonSafeObject(result || val, action);
//        });
//    }
//}




//var init = () => {

//    // Ensure init is only performed once.
//    // TODO: this is a bit hacky... better way?
//    init = () => {};


//    // Check if the logFile already exists. Use fs.stat since fs.exists is deprecated.
//    var fileExists = true;
//    try { fs.statSync(storageLocation); } catch (ex) { fileExists = false; }


//    if (fileExists) {

//        // TODO: replay log file, then truncate it
//        replayLog();

//        fs.unlinkSync(storageLocation);
//    }


//    // Resume the current epoch (if file exists) or start a new epoch (if no file).
//    // TODO: fix ...

//    logFileDescriptor = fs.openSync(storageLocation, 'a'); // TODO: ensure this file gets closed eventually!!!
//    //TODO: NEEDED!:   fs.flockSync(logFileDescriptor, 'ex'); // TODO: ensure exclusion. HANDLE EXCEPTIONS HERE! ALSO: THIS LOCK MUST BE EXPLICITLY REMOVED AFTER FINISHED!
//    //if (fileExists) {
//    //    logFileDescriptor = fs.openSync(storageLocation, 'ax');
//    //}
//    //else {
//    //    logFileDescriptor = fs.openSync(storageLocation, 'ax');
//    //}
//    (<any>fs.writeSync)(logFileDescriptor, `"BEGIN"`, null, 'utf8');
//    fs.fsyncSync(logFileDescriptor);

//};
