import assert = require('assert');
import crypto = require('crypto');
import _ = require('lodash');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import Promise = require('bluebird');
import Types = require('slownode');
import SlowRoutineFunction = require('../slowRoutine/slowRoutineFunction');
import runToCompletion = require('./runToCompletion');
import storage = require('../storage/storage');
export = asyncPseudoKeyword;


// TODO: return something that really has a prototype of type SlowAsyncFunction?
//       - ie so the following makes sense at runtime: ... if (fn instanceof SlowAsyncFunction) {...}
//       - Is this even possible. How to create a 'function' object with a different prototype?
//       - See: https://gist.github.com/tcr/4416956
//       - See: http://stackoverflow.com/a/17111430/1075886
//       - See: http://stackoverflow.com/a/346666/1075886


// TODO: doc...
var asyncPseudoKeyword: typeof Types.async = <any> ((bodyFunc: Function) => {

    // Validate arguments.
    assert(typeof bodyFunc === 'function');

    // Compile the details of the AsyncFunction definition based on the given bodyFunc.
    var sloroFunc = SlowRoutineFunction(bodyFunc, { yieldIdentifier: 'await', constIdentifier: '__const' });
    var source = sloroFunc.body.toString();
    var asyncFunctionId: string = crypto.createHash('sha1').update(source).digest('hex').slice(0, 40);

    // Create the callable part of the SlowAsyncFunction object. When called, this function creates a new
    // SlowAsyncFunctionActivation object from the given SlowRoutineFunction, and runs it to completion.
    var asyncFunction: Types.SlowAsyncFunction = <any> async((...args) => {

        // TODO: Create a new SlowPromise to represent the eventual result of the operation...

        // Create a new SlowAsyncFunctionActivation object using the given arguments.
        // TODO: subclass SlowRoutine so we have an runtime-identifiable prototype?
        var safa: Types.SlowAsyncFunctionActivation = sloroFunc.apply(sloroFunc, args);

        // Add slow state to the SlowAsyncFunctionActivation instance.
        safa._slow = {
            type: 'SlowAsyncFunctionActivation',
            id: null,
            asyncFunctionId,
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
        source,
        originalSource: bodyFunc.toString()
    };

    // Ensure the SlowAsyncFunction definition has been persisted to storage.
    storage.upsert(asyncFunction._slow);

    // Return the SlowAsyncFunction instance.
    return asyncFunction;
});
