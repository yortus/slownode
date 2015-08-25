var assert = require('assert');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var db = require('../knexConnection');
var deserialize = require('../serialization/deserialize');
var SlowRoutine = require('../slowRoutine/slowRoutine');
var runToCompletion = require('./runToCompletion');
// TODO: doc...
var rehydrate = async(function () {
    // Loop over all currently running async functions as recorded in DB.
    await(getAsyncFunctionActivationsWithSource()).forEach(function (activation) {
        // Should never happen.
        assert(!!activation.source);
        // Load the corresponding function.
        var bodyFunc = eval('(' + activation.source + ')');
        // Deserialize the `state` and `awaiting` values.
        var state = deserialize(activation.state);
        var awaiting = deserialize(activation.awaiting);
        // Instantiate a SlowRoutine from the persisted state.
        var sloro = SlowRoutine(bodyFunc, state);
        // Resume running the SlowRoutine to completion. It effectively picks up where it last left off.
        // NB: Don't wait for completion here, just get it running....
        runToCompletion(activation.id, sloro, awaiting);
    });
});
// TODO: doc...
function getAsyncFunctionActivationsWithSource() {
    return db('AsyncFunctionActivation')
        .select()
        .leftJoin('AsyncFunction', 'AsyncFunctionActivation.asyncFunctionId', 'AsyncFunction.id');
}
module.exports = rehydrate;
//# sourceMappingURL=rehydrate.js.map