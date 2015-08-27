import assert = require('assert');
import crypto = require('crypto');
import _ = require('lodash');
import Types = require('slownode');
import SlowPromise = require('../promises/slowPromise');
import SlowRoutineFunction = require('../coroutines/slowRoutineFunction');
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
    // TODO: optimise! SlowRoutineFunction is VERY EXPENSIVE!!!
    //       - better: hash the original source instead of the sloroFunc source, and only make a new sloroFunc if the hash hasn't already been created.
    var sloroFunc = SlowRoutineFunction(bodyFunc, { yieldIdentifier: 'await', constIdentifier: '__const' });
    var source = sloroFunc.body.toString();
    var asyncFunctionId: string = crypto.createHash('sha1').update(source).digest('hex').slice(0, 40);

    // Create the callable part of the SlowAsyncFunction object. When called, this function creates a new
    // SlowAsyncFunctionActivation object from the given SlowRoutineFunction, and runs it to completion.
    var asyncFunction: Types.SlowAsyncFunction = <any> ((...args) => {

        // TODO: Create a new SlowPromise to represent the eventual result of the operation...
        var deferred = SlowPromise.deferred();

        // Create a new SlowAsyncFunctionActivation object using the given arguments.
        // TODO: subclass SlowRoutine so we have an runtime-identifiable prototype?
        var safa: Types.SlowAsyncFunctionActivation = sloroFunc.apply(sloroFunc, args);

        // Add slow state to the SlowAsyncFunctionActivation instance.
        safa._slow = {
            type: 'SlowAsyncFunctionActivation',
            asyncFunction,
            state: safa.state,
            awaiting: Promise.resolve(),
            resolve: deferred.resolve,
            reject: deferred.reject
        };

        // Persist the SlowAsyncFunctionActivation's initial state to the database.
        storage.upsert(safa);

        // Run the SlowAsyncFunctionActivation instance to completion, and return the promise of completion.
        runToCompletion(safa);
        return deferred.promise;
    });

    // Add slow state to the SlowAsyncFunction instance.
    asyncFunction._slow = {
        type: 'SlowAsyncFunction',
        id: asyncFunctionId,
        source,
        originalSource: bodyFunc.toString()
    };

    // Ensure the SlowAsyncFunction definition has been persisted to storage.
    storage.upsert(asyncFunction);

    // Return the SlowAsyncFunction instance.
    return asyncFunction;
});
