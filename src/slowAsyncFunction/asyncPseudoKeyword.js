var assert = require('assert');
var crypto = require('crypto');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var db = require('../knexConnection');
var SlowRoutineFunction = require('../slowRoutine/slowRoutineFunction');
var runToCompletion = require('./runToCompletion');
var serialize = require('../serialization/serialize');
// TODO: return something that really has a prototype of type SlowAsyncFunction?
//       - ie so the following makes sense at runtime: ... if (fn instanceof SlowAsyncFunction) {...}
// TODO: doc...
var asyncPseudoKeyword = (function (bodyFunc) {
    // Validate arguments.
    assert(typeof bodyFunc === 'function');
    // Create a SlowRoutineFunction instance for the given body function.
    var sloroFunc = SlowRoutineFunction(bodyFunc, { yieldIdentifier: 'await', constIdentifier: '__const' });
    // Initiate retreival of the function's id from the database.
    // This will persist the function to the database if it is not already present there.
    var promiseOfFunctionId = getPersistentFunctionId(sloroFunc, bodyFunc);
    // Create a Promise-returning async function that runs an instance of the given SlowRoutineFunction to completion.
    var result = async(function () {
        // TODO: Create a new SlowPromise to represent the eventual result of the operation...
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        // Create a new SlowRoutine object using the given arguments.
        var sloro = sloroFunc.apply(sloroFunc, args);
        // Persist the SlowRoutine's initial state to the database, and link it to its database id.
        var functionId = await(promiseOfFunctionId); // TODO: what if this throws?
        sloro._srid = await(db.table('AsyncFunctionActivation').insert({ functionId: functionId, state: serialize(sloro._state), awaiting: null }))[0];
        // Run the SlowRoutine instance to completion. If it throws, we throw. If it returns, we return.
        await(runToCompletion(sloro));
    });
    // Return the async function.
    // TODO: should it also have some persistent ID or ...?
    return result;
});
// TODO: doc...
// TODO: error handling needed?? What happens on failure here?
// TODO: minify source before storing?
var getPersistentFunctionId = async(function (sloroFunc, originalFunc) {
    // Compute the hash of the SlowRoutineFunction's _body function source code.
    var hash = crypto.createHash('sha256').update(sloroFunc._body.toString()).digest('base64').slice(0, 64);
    // Check if the function is already persisted. If so, return its id.
    var functionIds = await(db.table('Function').select('id').where('hash', hash));
    if (functionIds.length > 0)
        return functionIds[0].id;
    // Add the function information to the database and return the INSERTed id.
    var source = sloroFunc._body.toString();
    var originalSource = originalFunc.toString();
    var insertedIds = await(db.table('Function').insert({ hash: hash, source: source, originalSource: originalSource }));
    return insertedIds[0];
});
module.exports = asyncPseudoKeyword;
//# sourceMappingURL=asyncPseudoKeyword.js.map