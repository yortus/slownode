var assert = require('assert');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var db = require('../knexConnection');
var deserialize = require('../serialization/deserialize');
var SlowRoutine = require('../slowRoutine/slowRoutine');
var runToCompletion = require('./runToCompletion');
// TODO: doc...
var rehydrate = async(function () {
    var activations = await(getActivationsWithSource());
    activations.forEach(function (activation) {
        assert(activation.source.length > 0);
        // Load the corresponding function.
        var bodyFunc = eval('(' + activation.source + ')');
        // Deserialize the `state` and `awaiting` values.
        var state = deserialize(activation.state);
        var awaiting = deserialize(activation.awaiting);
        // Instantiate a SlowRoutine from the persisted state.
        var sloro = SlowRoutine(bodyFunc, state);
        sloro._srid = activation.id;
        // Resume running the SlowRoutine to completion. It effectively picks up where it last left off.
        // NB: Don't wait for completion here, just get it running....
        runToCompletion(sloro, awaiting);
    });
});
function getActivationsWithSource() {
    return db('AsyncFunctionActivation')
        .select()
        .leftJoin('Function', 'AsyncFunctionActivation.functionId', 'Function.id');
}
module.exports = rehydrate;
//# sourceMappingURL=rehydrate.js.map