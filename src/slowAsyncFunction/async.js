var assert = require('assert');
var crypto = require('crypto');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var db = require('../knexConnection');
var SlowRoutineFunction = require('../slowRoutine/slowRoutineFunction');
var slowAsync = (function (bodyFunc) {
    // Create a SlowRoutineFunction instance for the given body function.
    var sloroFunc = SlowRoutineFunction(bodyFunc, { yieldIdentifier: 'await', constIdentifier: '__const' });
    // Initiate retreival of the function's id from the database.
    // This will persist the function to the database if it is not already present there.
    var promiseOfFunctionId = getPersistentFunctionId(sloroFunc, bodyFunc);
    // Create a Promise-returning async function that runs the given SlowRoutineFunction to completion.
    var result = async(function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        // Create a SlowRoutine object using the given arguments.
        var sloro = sloroFunc.apply(sloroFunc, args);
        // Persist the SlowRoutine instance to the database, and link it to its database id.
        var functionId = await(promiseOfFunctionId); // TODO: what if this throws?
        var sloroId = await(db.table('SlowRoutine').insert({ functionId: functionId, state: serialize(sloro._state) }))[0];
        sloro._srid = sloroId;
        // Run the SlowRoutine instance to completion. If it throws, we throw. If it returns, we return.
        try {
            var value = null, error = null;
            while (true) {
                // Resume the SlowRoutine. If it throws, we throw.
                var yielded = error ? sloro.throw(error) : sloro.next(value);
                // If the SlowRoutine returned, then return its result.
                if (yielded.done)
                    return yielded.value;
                // The SlowRoutine yielded. The yielded value must be awaitable.
                // Update the state in the database before awaiting.
                await(db.table('SlowRoutine').update({ state: serialize(sloro._state) }).where('id', sloroId));
                // TODO: implement await... The SlowRoutine will be resumed with the eventual result/error.
                // TODO: temp testing... use SlowPromise here? Also support normal Promises?
                var p = yielded.value;
                assert(p && typeof p.then === 'function', 'await: expected argument to be a Promise');
                try {
                    error = null, value = await(p);
                }
                catch (ex) {
                    error = ex;
                }
            }
        }
        finally {
            // Remove the completed SlowRoutine from the database.
            await(db.table('SlowRoutine').delete().where('id', sloroId));
        }
    });
    // Return the async function.
    return result;
});
// TODO: doc...
// TODO: error handling needed?? What happens on failure here?
// TODO: minify source before storing?
var getPersistentFunctionId = async(function (sloroFunc, originalFunc) {
    // Compute the hash of the SlowRoutineFunction's _body function source code.
    var hash = crypto.createHash('sha256').update(sloroFunc._body.toString()).digest('base64').slice(0, 64);
    // Check if the function is already persisted. If so, return its id.
    var functionIds = await(db.table('SlowRoutineFunction').select('id').where('hash', hash));
    if (functionIds.length > 0)
        return functionIds[0].id;
    // Add the function information to the database and return the INSERTed id.
    var source = sloroFunc._body.toString();
    var originalSource = originalFunc.toString();
    var insertedIds = await(db.table('SlowRoutineFunction').insert({ hash: hash, source: source, originalSource: originalSource }));
    return insertedIds[0];
});
// TODO: temp testing... move this out into its own file...
function serialize(value) {
    // TODO: temp testing... need to do more than this...
    return JSON.stringify(value);
}
module.exports = slowAsync;
//# sourceMappingURL=async.js.map