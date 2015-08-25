var SlowRoutineFunction = require('./slowRoutine/slowRoutineFunction');
var asyncPseudoKeyword = require('./slowAsyncFunction/asyncPseudoKeyword');
var storage = require('./storage/storage');
var rehydrate = require('./slowAsyncFunction/rehydrate');
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
var api = {};
api.SlowRoutineFunction = SlowRoutineFunction;
api.async = asyncPseudoKeyword;
module.exports = api;
//# sourceMappingURL=index.js.map