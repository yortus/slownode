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


// TODO: doc...
var asyncPseudoKeyword: typeof Types.async = <any> ((bodyFunc: Function) => {

    // Validate arguments.
    assert(typeof bodyFunc === 'function');

    // Compile the details of the AsyncFunction definition based on the given bodyFunc.
    var sloroFunc = SlowRoutineFunction(bodyFunc, { yieldIdentifier: 'await', constIdentifier: '__const' });
    var source = sloroFunc.body.toString();
    var asyncFunctionId: string = crypto.createHash('sha256').update(source).digest('base64').slice(0, 64);

    // Create the callable part of the AsyncFunction object. When called, this function obtains
    // a new SlowRoutine object from the given SlowRoutineFunction, and runs it to completion.
    var asyncFunction: Types.SlowAsyncFunction = <any> async((...args) => {

        // TODO: Create a new SlowPromise to represent the eventual result of the operation...


        // Create a new SlowRoutine object using the given arguments.
        var sloro: Types.SlowRoutine = sloroFunc.apply(sloroFunc, args);

        // Persist the SlowRoutine's initial state to the database, and link it to its database id.
        var activationId = <number> storage.add('SlowAsyncFunctionActivation', { asyncFunctionId, state: sloro.state, awaiting: null });

        // Run the SlowRoutine instance to completion. If it throws, we throw. If it returns, we return.
        await(runToCompletion(activationId, sloro));
    });

    // Add metadata to the SlowAsyncFunction instance.
    asyncFunction._slow = {
        type: 'SlowAsyncFunction',
        id: asyncFunctionId
    };

    // Ensure the AsyncFunction definition has been persisted to storage.
    if (!storage.get('SlowAsyncFunction', asyncFunctionId)) {
        storage.add('SlowAsyncFunction', { source, originalSource: bodyFunc.toString() }, asyncFunctionId);
    }

    // Return the AsyncFunction instance.
    return asyncFunction;
});
