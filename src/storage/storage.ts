import assert = require('assert');
import fs = require('fs');
import path = require('path');
import crypto = require('crypto');
import _ = require('lodash');
import types = require('types');
import storageLocation = require('./storageLocation');
import dehydrate = require('./dehydrate');
import rehydrate = require('./rehydrate');
import typeRegistry = require('./typeRegistry');


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
export function registerType(registration: types.SlowObject.Registration) {
    typeRegistry.store(registration);
}


// TODO: temp testing...
export function lookup(slowObj: types.SlowObject): types.SlowObject {
    return cache[slowObj._slow.id];
}


var init = () => {

    // Ensure init is only performed once.
    // TODO: this is a bit hacky... better way?
    init = () => {};


    // Check if the logFile already exists. Use fs.stat since fs.exists is deprecated.
    var fileExists = true;
    try { fs.statSync(storageLocation); } catch (ex) { fileExists = false; }


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
    (<any>fs.writeSync)(logFileDescriptor, `"BEGIN"`, null, 'utf8');
    fs.fsyncSync(logFileDescriptor);

};


// TODO: doc...
export function track(slowObj: types.SlowObject) {
    init();

    var slow = slowObj._slow;
    slow.id = slow.id || `#${++idCounter}`;
    var key = slow.id;
    var serializedValue = JSON.stringify(dehydrateDef(slowObj));
    cache[`${key}`] = slowObj;

    // TODO: testing... NB node.d.ts is missing a typing here...
    try {
        (<any>fs.writeSync)(logFileDescriptor, `,\n\n\n"${key}", ${serializedValue}`, null, 'utf8');
        fs.fsyncSync(logFileDescriptor);
    }
    catch (ex) {
        console.log('FILE DESCRIPTOR: ' + logFileDescriptor);
        throw ex;
    }
}


// TODO: doc...
export function clear(slowObj: types.SlowObject) {
    init();

    var slow = slowObj._slow;
    var key = slow.id;
    delete cache[key];

    // TODO: testing...
    (<any>fs.writeSync)(logFileDescriptor, `,\n\n\n"${key}", null`, null, 'utf8');
    fs.fsyncSync(logFileDescriptor);
}






// TODO: temp testing...
var registrations: types.SlowObject.Registration[];
function dehydrateDef(value: any) {
    registrations = registrations || typeRegistry.fetchAll();

    var jsonSafeValue;
    for (var i = 0; jsonSafeValue === void 0 && i < registrations.length; ++i) {
        var reg = registrations[i];
        jsonSafeValue = reg.dehydrate(value, dehydrate);
    }
    return jsonSafeValue;
}


function rehydrateDef(jsonSafeValue: any) {




    var slow: { type; id; } = <any> {};
    _.keys(jsonSafeValue).forEach(propName => {
        var propValue = jsonSafeValue[propName];
        //if (propValue && propValue.$ref) {
        //    Object.defineProperty(slow, propName, {
        //        get: () => cache[propValue.$ref]
        //    });
        //}
        //else {
            slow[propName] = rehydrate(propValue);
        //}
    });
    var rehydrateSlowObject = typeRegistry.fetch(slow.type).rehydrate;
    var result = rehydrateSlowObject(slow);
    return result;
}





// TODO: must support circular refs between SlowObjects when rehydrating them!
function replayLog() {


    var json = '[' + fs.readFileSync(storageLocation, 'utf8') + ']';
    var logEntries: any[] = JSON.parse(json);
    var pos = 1;
    var keyOrder = [];


    while (pos < logEntries.length) {
        var key: string = logEntries[pos++];
        var jsonSafeValue: any = logEntries[pos++];

        if (!(key in cache)) keyOrder.push(key);
        cache[key] = jsonSafeValue;
    }


    //........
    traverseJsonSafeObject(cache, (obj, key) => {
        if (key === '$ref') {
            console.log(`{ $ref: ${obj[key]}}`);
            var val = obj[key];
            delete obj[key];
            Object.defineProperty(obj, key, {
                get: () => cache[val]
            });
        }
    });


    keyOrder.forEach(key => {
        if (cache[key] === null) {
            delete cache[key];
        }
        else {
            // TODO: important - relies on defs before refs!
            var slowObj: types.SlowObject = rehydrateDef(cache[key]);
            cache[key] = slowObj;
        }
    });
}





// TODO: temp testing...
function traverseJsonSafeObject(value, action: (obj: any, key: string) => any) {
    if (_.isPlainObject(value) || _.isArray(value)) {
        //TODO:...
        _.forEach(value, (val, key, obj) => {
            var result = action(obj, key);
            if (result === false) return;
            traverseJsonSafeObject(result || val, action);
        });
    }
}
