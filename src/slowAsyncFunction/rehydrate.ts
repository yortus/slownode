//import assert = require('assert');
//import async = require('asyncawait/async');
//import await = require('asyncawait/await');
//import Types = require('slownode');
//import SlowPromise = require('../slowPromise');
//import SlowRoutine = require('../slowRoutine/slowRoutine');
//import runToCompletion = require('./runToCompletion');
//import storage = require('../storage/storage');
//export = rehydrate;


//// TODO: doc...
//var rehydrate = async(() => {

//    // Loop over all currently running SlowAsyncFunctions as recorded in storage.
//    getSlowAsyncFunctionActivations().forEach(activation => {

//        // Should never happen.
//        assert(typeof activation.source === 'string');
        
//        // Load the corresponding function.
//        var bodyFunc = eval('(' + activation.source + ')');

//        // Create a SlowAsyncFunctionActivation instance from the persisted state.
//        var safa = <Types.SlowAsyncFunctionActivation> SlowRoutine(bodyFunc, activation.state);
//        safa._slow = { // TODO: simplify below assignments - they are all straight copies except type and source
//            type: 'SlowAsyncFunctionActivation',
//            id: activation.id,
//            asyncFunction: activation.asyncFunction,
//            state: activation.state,
//            awaiting: activation.awaiting,
//            resolve: activation.resolve,
//            reject: activation.reject
//        };

//        // Resume running the SlowAsyncFunctionActivation to completion. It effectively picks up where it last left off.
//        // NB: Don't wait for completion here, just get it running....
//        runToCompletion(safa);
//    });
//});


//// TODO: doc...
//function getSlowAsyncFunctionActivations() {
//    var records = storage.find('SlowAsyncFunctionActivation');
//    var results = records.map(raw => ({
//        id: <number> raw.id,
//        asyncFunction: raw['asyncFunctionId'], // TODO: definitely broken...
//        state: raw['state'],
//        awaiting: raw['awaiting'],
//        resolve: raw['resolve'],
//        reject: raw['reject'],
//        source: <string> (storage.find('SlowAsyncFunction', raw['asyncFunctionId'])[0] || {})['source']
//    }));
//    return results;
//}
