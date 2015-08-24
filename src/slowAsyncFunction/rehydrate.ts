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

    // Loop over all currently running async functions as recorded in DB.
    await(getAsyncFunctionActivationsWithSource()).forEach(activation => {

        // Should never happen.
        assert(!!activation.source);
        
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


// TODO: doc...
function getAsyncFunctionActivationsWithSource(): Promise<AsyncFunctionActivationWithSource[]> {
    return db('AsyncFunctionActivation')
        .select()
        .leftJoin('Function', 'AsyncFunctionActivation.functionId', 'Function.id');
}


// TODO: this is a mashup of two DB table schemas - put in .d.ts and use TS intersection types when available
interface AsyncFunctionActivationWithSource {
    id: number;
    functionId: number;
    state: string;
    awaiting: string;
    source: string;
    hash: string;
    originalSource: string;
}
