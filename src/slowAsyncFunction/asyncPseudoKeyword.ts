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

    // Create a SlowRoutineFunction instance for the given body function.
    var sloroFunc = SlowRoutineFunction(bodyFunc, { yieldIdentifier: 'await', constIdentifier: '__const' });

    // Initiate retreival of the function's id from the database.
    // This will persist the function to the database if it is not already present there.
    var promiseOfFunctionId = getPersistentFunctionId(sloroFunc, bodyFunc);

    // Create a Promise-returning async function that runs an instance of the given SlowRoutineFunction to completion.
    var result = async((...args) => {

        // TODO: Create a new SlowPromise to represent the eventual result of the operation...


        // Create a new SlowRoutine object using the given arguments.
        var sloro: Types.SlowRoutine = sloroFunc.apply(sloroFunc, args);

        // Persist the SlowRoutine's initial state to the database, and link it to its database id.
        var asyncFunctionId = await(promiseOfFunctionId); // TODO: what if this throws?
        var activationId = <number> storage.add('AsyncFunctionActivation', { asyncFunctionId, state: sloro.state, awaiting: null });

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
var getPersistentFunctionId = async((sloroFunc: Types.SlowRoutineFunction, originalFunc: Function) => {

    // Compute the hash of the SlowRoutineFunction's `body` function source code.
    var hash: string = crypto.createHash('sha256').update(sloroFunc.body.toString()).digest('base64').slice(0, 64);

    // Check if the function is already persisted. If not, persist it now.
    if (!storage.get('AsyncFunction', hash)) {
        var source = sloroFunc.body.toString();
        var originalSource = originalFunc.toString();
        storage.add('AsyncFunction', { source, originalSource }, hash);
    }

    // Return the function's persistent ID, which is just its hash.
    return hash;    
});
