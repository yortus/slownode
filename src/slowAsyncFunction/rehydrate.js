var assert = require('assert');
var async = require('asyncawait/async');
var SlowRoutine = require('../slowRoutine/slowRoutine');
var runToCompletion = require('./runToCompletion');
var storage = require('../storage/storage');
// TODO: doc...
var rehydrate = async(function () {
    // Loop over all currently running async functions as recorded in DB.
    getAsyncFunctionActivationsWithSource().forEach(function (activation) {
        // Should never happen.
        assert(typeof activation.source === 'string');
        // Load the corresponding function.
        var bodyFunc = eval('(' + activation.source + ')');
        // Instantiate a SlowRoutine from the persisted state.
        var sloro = SlowRoutine(bodyFunc, activation.state);
        // Resume running the SlowRoutine to completion. It effectively picks up where it last left off.
        // NB: Don't wait for completion here, just get it running....
        runToCompletion(activation.asyncFunctionId, activation.id, sloro, activation.awaiting);
    });
});
// TODO: doc...
function getAsyncFunctionActivationsWithSource() {
    var rawActivations = storage.find('SlowAsyncFunctionActivation');
    var activations = rawActivations.map(function (raw) { return ({
        id: raw.id,
        state: raw.value.state,
        awaiting: raw.value.awaiting,
        asyncFunctionId: raw.value.asyncFunctionId,
        source: (storage.get('SlowAsyncFunction', raw.value.asyncFunctionId) || {}).source
    }); });
    return activations;
}
module.exports = rehydrate;
//# sourceMappingURL=rehydrate.js.map