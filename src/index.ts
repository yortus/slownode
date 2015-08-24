import fs = require('fs');
import path = require('path');
import Types = require('slownode');
import databaseLocation = require('./databaseLocation');
import SlowRoutineFunction = require('./slowRoutine/slowRoutineFunction');
import asyncPseudoKeyword = require('./slowAsyncFunction/asyncPseudoKeyword');
import rehydrate = require('./slowAsyncFunction/rehydrate');
export = api;


// TODO: set up a global handler (using bluebird API or node API?) to catch unhandled async
//       errors that arise from withing this module (make a SlowError type?).
//       eg, SlowPromise constructor is synchronous, but internally it must access DB so it
//       may throw an async error which the caller has no way of catching.


// ======================================================================================
// =                                                                                    =
// =  NB: Module initialization must be synchronous, so we use only sync methods here.  =
// =                                                                                    =
// ======================================================================================


// Check if the database already exists. Use fs.stat since fs.exists is deprecated.
var dbExists = true;
try { fs.statSync(databaseLocation); } catch (ex) { dbExists = false; }


// Resume the current epoch (if DB exists) or start a new epoch (if no DB).
if (!dbExists) {
    var templateLocation = path.join(__dirname, '../empty.db');
    fs.writeFileSync(databaseLocation, fs.readFileSync(templateLocation));
}


// Connect to the database
var db = require('./knexConnection');


// TODO: temp testing... rehydrate any running async functions...
// TODO: we can't wait for completion here, just get it started... implications? Eg sqlite serialisation needed?
rehydrate();


// TODO: temp testing... Build the API for export...
var api: typeof Types = <any> {};
api.SlowRoutineFunction = <any> SlowRoutineFunction;
api.async = asyncPseudoKeyword;
