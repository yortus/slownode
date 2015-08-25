var assert = require('assert');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Promise = require('bluebird');
var db = require('../knexConnection');
var serialize = require('../serialization/serialize');
/**
 * Runs the given SlowRoutine instance to completion. First, the `awaiting` value is
 * awaited, and then the SlowRoutine is resumed with the eventual value. Subsequent
 * values yielded by the SlowRoutine are awaited, and the SlowRoutine is resumed with
 * their eventual values each time. This process continues until the SlowRoutine either
 * returns or throws. If it throws, this function throws the error. If it returns,
 * this function returns its result.
 */
var runToCompletion = async(function (afaId, sloro, awaiting) {
    try {
        // Validate arguments.
        if (arguments.length <= 1)
            awaiting = Promise.resolve(void 0);
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
            if (yielded.done)
                return yielded.value;
            // The SlowRoutine yielded. Ensure the yielded value is awaitable.
            // TODO: what should be allowed here? Implement checks...
            // TODO: what should be done if the value is NOT awaitable? How to handle failure? Just throw?
            awaiting = yielded.value;
            assert(awaiting && typeof awaiting.then === 'function', 'await: expected argument to be a Promise');
            // Before looping again, Persist the current state of the SlowRoutine and that of the value to be awaited.
            // If the process is restarted before the awaited value is resolved/rejected, then the SlowRoutine will
            // be able to continue from this persisted state.
            var savedState = serialize(sloro.state);
            var savedAwaiting = serialize(yielded.value);
            await(db.table('AsyncFunctionActivation').update({ state: savedState, awaiting: savedAwaiting }).where('id', afaId));
        }
    }
    finally {
        // The SlowRoutine has terminated. Remove its state from the database.
        await(db.table('AsyncFunctionActivation').delete().where('id', afaId));
    }
});
module.exports = runToCompletion;
//# sourceMappingURL=runToCompletion.js.map