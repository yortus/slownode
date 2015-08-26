var assert = require('assert');
var crypto = require('crypto');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Promise = require('bluebird');
var SlowRoutineFunction = require('../slowRoutine/slowRoutineFunction');
var runToCompletion = require('./runToCompletion');
var storage = require('../storage/storage');
// TODO: return something that really has a prototype of type SlowAsyncFunction?
//       - ie so the following makes sense at runtime: ... if (fn instanceof SlowAsyncFunction) {...}
//       - Is this even possible. How to create a 'function' object with a different prototype?
//       - See: https://gist.github.com/tcr/4416956
//       - See: http://stackoverflow.com/a/17111430/1075886
//       - See: http://stackoverflow.com/a/346666/1075886
// TODO: doc...
var asyncPseudoKeyword = (function (bodyFunc) {
    // Validate arguments.
    assert(typeof bodyFunc === 'function');
    // Compile the details of the AsyncFunction definition based on the given bodyFunc.
    var sloroFunc = SlowRoutineFunction(bodyFunc, { yieldIdentifier: 'await', constIdentifier: '__const' });
    var source = sloroFunc.body.toString();
    var asyncFunctionId = crypto.createHash('sha1').update(source).digest('hex').slice(0, 40);
    // Create the callable part of the SlowAsyncFunction object. When called, this function creates a new
    // SlowAsyncFunctionActivation object from the given SlowRoutineFunction, and runs it to completion.
    var asyncFunction = async(function () {
        // TODO: Create a new SlowPromise to represent the eventual result of the operation...
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        // Create a new SlowAsyncFunctionActivation object using the given arguments.
        // TODO: subclass SlowRoutine so we have an runtime-identifiable prototype?
        var safa = sloroFunc.apply(sloroFunc, args);
        // Add slow state to the SlowAsyncFunctionActivation instance.
        safa._slow = {
            type: 'SlowAsyncFunctionActivation',
            id: null,
            asyncFunctionId: asyncFunctionId,
            state: safa.state,
            awaiting: Promise.resolve()
        };
        // Persist the SlowAsyncFunctionActivation's initial state to the database.
        safa._slow.id = storage.insert(safa._slow);
        // Run the SlowAsyncFunctionActivation instance to completion. If it throws, we throw. If it returns, we return.
        await(runToCompletion(safa));
    });
    // Add slow state to the SlowAsyncFunction instance.
    asyncFunction._slow = {
        type: 'SlowAsyncFunction',
        id: asyncFunctionId,
        source: source,
        originalSource: bodyFunc.toString()
    };
    // Ensure the SlowAsyncFunction definition has been persisted to storage.
    storage.upsert(asyncFunction._slow);
    // Return the SlowAsyncFunction instance.
    return asyncFunction;
});
module.exports = asyncPseudoKeyword;
//# sourceMappingURL=asyncPseudoKeyword.js.map