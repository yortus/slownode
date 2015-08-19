import assert = require('assert');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import db = require('../knexConnection');
import deserialize = require('../serialization/deserialize');
import SlowRoutine = require('../slowRoutine/slowRoutine');
import runToCompletion = require('./runToCompletion');
export = rehydrate;


// TODO: doc...
var rehydrate = async(() => {

    var asyncFunctionActivations: { id: number, functionId: number, state: string, awaiting: string }[];
    asyncFunctionActivations = await(db.table('AsyncFunctionActivation').select());

    asyncFunctionActivations.forEach(activation => {

        // Load the corresponding function.
        var functionSources: { source: string; }[];
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
