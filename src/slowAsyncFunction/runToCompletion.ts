import assert = require('assert');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import Promise = require('bluebird');
import Types = require('slownode');
import db = require('../knexConnection');
import serialize = require('../serialization/serialize');
export = runToCompletion;


/**
 * Runs the given SlowRoutine instance to completion. First, the `awaiting` value is
 * awaited, and then the SlowRoutine is resumed with the eventual value. Subsequent
 * values yielded by the SlowRoutine are awaited, and the SlowRoutine is resumed with
 * their eventual value each time. This process continues until the SlowRoutine either
 * returns or throws. If it throws, this function throws the error. If it returns,
 * this function returns its result.
 */
var runToCompletion: RunToCompletion = async(function (sloro: Types.SlowRoutine, awaiting?: Promise<any>) {
    try {

        // Validate arguments.
        if (arguments.length <= 1) awaiting = Promise.resolve(void 0);

        // Proceed in a loop until the SlowRoutine either returns or throws.
        var value = null, error = null;
        while (true) {

            // Wait for the awaited value to be resolved or rejected.
            try {
                error = null, value = await(awaiting);
            }
            catch (ex) {
                error = ex;
            }

            // Resume the SlowRoutine with the resolved/rejected value.
            // NB: If the SlowRoutine throws, this function will throw here.
            var yielded = error ? sloro.throw(error) : sloro.next(value);

            // If the SlowRoutine returned, then return its result.
            if (yielded.done) return yielded.value;

            // The SlowRoutine yielded. Ensure the yielded value is awaitable.
            // TODO: what should be allowed here? Implement checks...
            // TODO: what should be done if the value is NOT awaitable? How to handle failure? Just throw?
            awaiting = yielded.value;
            assert(awaiting && typeof awaiting.then === 'function', 'await: expected argument to be a Promise');

            // Before looping again, Persist the current state of the SlowRoutine and that of the value to be awaited.
            // If the process is restarted before the awaited value is resolved/rejected, then the SlowRoutine will
            // be able to continue from this persisted state.
            var savedState = serialize(sloro._state);
            var savedAwaiting = serialize(yielded.value);
            await(db.table('AsyncFunctionActivation').update({ state: savedState, awaiting: savedAwaiting }).where('id', sloro._srid));
        }
    }
    finally {

        // The SlowRoutine has terminated. Remove its state from the database.
        await(db.table('AsyncFunctionActivation').delete().where('id', sloro._srid));
    }
});


// Helper type to pick up optionality of second parameter.
type RunToCompletion = (sloro: Types.SlowRoutine, awaiting?: Promise<any>) => Promise<any>;
