var assert = require('assert');
var async = require('asyncawait/async');
var SlowRoutine = require('../slowRoutine/slowRoutine');
var runToCompletion = require('./runToCompletion');
var storage = require('../storage/storage');
// TODO: doc...
var rehydrate = async(function () {
    // Loop over all currently running SlowAsyncFunctions as recorded in storage.
    getSlowAsyncFunctionActivations().forEach(function (activation) {
        // Should never happen.
        assert(typeof activation.source === 'string');
        // Load the corresponding function.
        var bodyFunc = eval('(' + activation.source + ')');
        // Create a SlowAsyncFunctionActivation instance from the persisted state.
        var safa = SlowRoutine(bodyFunc, activation.state);
        safa._slow = {
            type: 'SlowAsyncFunctionActivation',
            id: activation.id,
            asyncFunction: activation.asyncFunction,
            state: activation.state,
            awaiting: activation.awaiting,
            resolve: activation.resolve,
            reject: activation.reject
        };
        // Resume running the SlowAsyncFunctionActivation to completion. It effectively picks up where it last left off.
        // NB: Don't wait for completion here, just get it running....
        runToCompletion(safa);
    });
});
// TODO: doc...
function getSlowAsyncFunctionActivations() {
    var records = storage.find('SlowAsyncFunctionActivation');
    var results = records.map(function (raw) { return ({
        id: raw.id,
        asyncFunction: raw['asyncFunctionId'],
        state: raw['state'],
        awaiting: raw['awaiting'],
        resolve: raw['resolve'],
        reject: raw['reject'],
        source: (storage.find('SlowAsyncFunction', raw['asyncFunctionId'])[0] || {})['source']
    }); });
    return results;
}
module.exports = rehydrate;
//# sourceMappingURL=rehydrate.js.map