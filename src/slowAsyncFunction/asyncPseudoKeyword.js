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
    // Compile the details of the AsyncFunction definition based on the given bodyFunc.
    var sloroFunc = SlowRoutineFunction(bodyFunc, { yieldIdentifier: 'await', constIdentifier: '__const' });
    var source = sloroFunc.body.toString();
    var asyncFunctionId = crypto.createHash('sha256').update(source).digest('base64').slice(0, 64);
    // Create the callable part of the AsyncFunction object. When called, this function obtains
    // a new SlowRoutine object from the given SlowRoutineFunction, and runs it to completion.
    var asyncFunction = async(function () {
        // TODO: Create a new SlowPromise to represent the eventual result of the operation...
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        // Create a new SlowRoutine object using the given arguments.
        var sloro = sloroFunc.apply(sloroFunc, args);
        // Persist the SlowRoutine's initial state to the database, and link it to its database id.
        var activationId = storage.add('AsyncFunctionActivation', { asyncFunctionId: asyncFunctionId, state: sloro.state, awaiting: null });
        // Run the SlowRoutine instance to completion. If it throws, we throw. If it returns, we return.
        await(runToCompletion(activationId, sloro));
    });
    // Add metadata to the SlowAsyncFunction instance.
    asyncFunction._slow = {
        type: 'AsyncFunction',
        id: asyncFunctionId
    };
    // Ensure the AsyncFunction definition has been persisted to storage.
    if (!storage.get('AsyncFunction', asyncFunctionId)) {
        storage.add('AsyncFunction', { source: source, originalSource: bodyFunc.toString() }, asyncFunctionId);
    }
    // Return the AsyncFunction instance.
    return asyncFunction;
});
module.exports = asyncPseudoKeyword;
//# sourceMappingURL=asyncPseudoKeyword.js.map