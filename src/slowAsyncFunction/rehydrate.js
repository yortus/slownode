var assert = require('assert');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var db = require('../knexConnection');
var deserialize = require('../serialization/deserialize');
var SlowRoutine = require('../slowRoutine/slowRoutine');
var runToCompletion = require('./runToCompletion');
// TODO: doc...
var rehydrate = async(function () {
    var asyncFunctionActivations;
    asyncFunctionActivations = await(db.table('AsyncFunctionActivation').select());
    asyncFunctionActivations.forEach(function (activation) {
        // Load the corresponding function.
        var functionSources;
        functionSources = await(db.table('Function').select('source').where('id', activation.functionId));
        assert(functionSources.length === 1);
        var bodyFunc = eval('(' + functionSources[0].source + ')');
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
module.exports = rehydrate;
//# sourceMappingURL=rehydrate.js.map