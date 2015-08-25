import assert = require('assert');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import SlowRoutine = require('../slowRoutine/slowRoutine');
import runToCompletion = require('./runToCompletion');
import storage = require('../storage/storage');
export = rehydrate;


// TODO: doc...
var rehydrate = async(() => {

    // Loop over all currently running async functions as recorded in DB.
    getAsyncFunctionActivationsWithSource().forEach(activation => {

        // Should never happen.
        assert(!!activation.source);
        
        // Load the corresponding function.
        var bodyFunc = eval('(' + activation.source + ')');

        // Instantiate a SlowRoutine from the persisted state.
        var sloro = SlowRoutine(bodyFunc, activation.state);

        // Resume running the SlowRoutine to completion. It effectively picks up where it last left off.
        // NB: Don't wait for completion here, just get it running....
        runToCompletion(activation.id, sloro, activation.awaiting);
    });
});


// TODO: doc...
function getAsyncFunctionActivationsWithSource() {

    var rawActivations = storage.find('SlowAsyncFunctionActivation');
    var activations = rawActivations.map(raw => ({
        id: <number> raw.id,
        state: raw.value.state,
        awaiting: raw.value.awaiting,
        source: <string> storage.get('SlowAsyncFunction', raw.value.asyncFunctionId)
    }));
    return activations;
}
