var SlowRoutineFunction = require('./coroutines/slowRoutineFunction');
var asyncPseudoKeyword = require('./asyncFunctions/asyncPseudoKeyword');
var SlowPromise = require('./promises/slowPromise');
var storage = require('./storage/storage');
//// TODO: Experiment with node-weak and global.gc to work out when to delete persistent slow objects. Works OK!
//// NB: must run node with the --expose-gc flag for this to work... eg node --expose-gc ./debug
//var weak = require('weak');
//scheduleGC();
//process.on('exit', () => {
//    console.log('Exiting!!!');
//    if (global.gc) global.gc();
//});
//function scheduleGC() {
//    setTimeout(() => {
//        if (global.gc) {
//            console.log('================================================================   GC   ================================================================');
//            global.gc();
//            scheduleGC();
//        }
//        else {
//            console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<< NO GC! >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
//        }
//    }, 100);
//}
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
// This will rehydrate everything...
storage.init();
// TODO: temp testing... rehydrate any running async functions...
// TODO: we can't wait for completion here, just get it started... implications? Eg sqlite serialisation needed?
//rehydrate();
// TODO: temp testing... Build the API for export...
var api = {};
api.async = asyncPseudoKeyword;
api.Promise = SlowPromise;
api.SlowPromise = SlowPromise;
api.SlowRoutineFunction = SlowRoutineFunction;
module.exports = api;
//# sourceMappingURL=index.js.map