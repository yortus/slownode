import Types = require('slownode');
import SlowRoutineFunction = require('./slowRoutine/slowRoutineFunction');
import asyncPseudoKeyword = require('./slowAsyncFunction/asyncPseudoKeyword');
import SlowPromise = require('./slowPromise/slowPromise');
import storage = require('./storage/storage');
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


// TODO: doc...
storage.init();


// TODO: temp testing... rehydrate any running async functions...
// TODO: we can't wait for completion here, just get it started... implications? Eg sqlite serialisation needed?
rehydrate();


// TODO: temp testing... Build the API for export...
var api: typeof Types = <any> {};
api.async = asyncPseudoKeyword;
api.Promise = SlowPromise;
api.SlowRoutineFunction = <any> SlowRoutineFunction;
