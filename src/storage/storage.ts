﻿import assert = require('assert');
import fs = require('fs');
import path = require('path');
import crypto = require('crypto');
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
    return cache[makeKey(slowObj._slow)];
}


export function init() {

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

}


export function upsert(slowObj: types.SlowObject) {
    var slow = slowObj._slow;
    slow.id = slow.id || `#${++idCounter}`;
    var serializedValue = JSON.stringify(dehydrate(slowObj));
    cache[`${makeKey(slow)}`] = slowObj;


    // TODO: testing... NB node.d.ts is missing a typing here...
    (<any>fs.writeSync)(logFileDescriptor, `,\n\n\n"UPSERT",\n${serializedValue}`, null, 'utf8');
    fs.fsyncSync(logFileDescriptor);
}


export function remove(slowObj: types.SlowObject) {
    var slow = slowObj._slow;
    var key = makeKey(slow);
    delete cache[key];


    // TODO: testing...
    (<any>fs.writeSync)(logFileDescriptor, `,\n\n\n"REMOVE",\n"${key}"`, null, 'utf8');
    fs.fsyncSync(logFileDescriptor);
}





function replayLog() {

    var json = '[' + fs.readFileSync(storageLocation, 'utf8') + ']';
    var logEntries: any[] = JSON.parse(json);
    var pos = 1;

    while (pos < logEntries.length) {
        var command: string = logEntries[pos++];
        var details: any = logEntries[pos++];
        switch (command) {

            case 'UPSERT':
                assert(details.$type === 'SlowDef');
                var slow = details.value;
                var key = makeKey(slow);

                // TODO: deserialize!!!!!!!!
                var value = rehydrate(details, slow => cache[makeKey(slow)]);
                cache[key] = value;
                break;

            case 'REMOVE':
                key = details;
                delete cache[key];
                break;

            default:
                throw new Error(`Unrecognised log entry command '${command}'`);
        }
    }
}


// TODO: doc...
function makeKey(slow: { type: string; id?: string|number; }) {
    return `${slow.id}-${slow.type}`;
}
