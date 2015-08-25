var assert = require('assert');
var crypto = require('crypto');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var SlowRoutineFunction = require('../slowRoutine/slowRoutineFunction');
var runToCompletion = require('./runToCompletion');
var storage = require('../storage/storage');
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
        var asyncFunctionId = await(promiseOfFunctionId); // TODO: what if this throws?
        var activationId = storage.add('AsyncFunctionActivation', { asyncFunctionId: asyncFunctionId, state: sloro.state, awaiting: null });
        // Run the SlowRoutine instance to completion. If it throws, we throw. If it returns, we return.
        await(runToCompletion(activationId, sloro));
    });
    // Return the async function.
    // TODO: should it also have some persistent ID or ...?
    return result;
});
// TODO: doc...
// TODO: error handling needed?? What happens on failure here?
// TODO: minify source before storing?
var getPersistentFunctionId = async(function (sloroFunc, originalFunc) {
    // Compute the hash of the SlowRoutineFunction's `body` function source code.
    var hash = crypto.createHash('sha256').update(sloroFunc.body.toString()).digest('base64').slice(0, 64);
    // Check if the function is already persisted. If not, persist it now.
    if (!storage.get('AsyncFunction', hash)) {
        var source = sloroFunc.body.toString();
        var originalSource = originalFunc.toString();
        storage.add('AsyncFunction', { source: source, originalSource: originalSource }, hash);
    }
    // Return the function's persistent ID, which is just its hash.
    return hash;
});
module.exports = asyncPseudoKeyword;
//# sourceMappingURL=asyncPseudoKeyword.js.map