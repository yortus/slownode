import assert = require('assert');
import crypto = require('crypto');
import _ = require('lodash');
import types = require('types');
import Steppable = require('../functions/steppable');
import SteppableFunction = require('../functions/steppableFunction');
import SlowPromise = require('../promises/slowPromise');
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
var asyncPseudoKeyword: types.Async = <any> ((bodyFunc: Function) => {

    // Validate arguments.
    assert(typeof bodyFunc === 'function');

    // Compile the details of the AsyncFunction definition based on the given bodyFunc.
    // TODO: optimise! SteppableFunction is VERY EXPENSIVE!!!
    //       - better: hash the original source instead of the steppableFunc source, and only make a new steppableFunc if the hash hasn't already been created.
    var steppableFunc = SteppableFunction(bodyFunc, { pseudoYield: 'await', pseudoConst: '__const' });
    var stateMachineSource = steppableFunc.stateMachine.toString();

    var originalSource = bodyFunc.toString();
    var asyncFunction = makeSlowAsyncFunction(steppableFunc, stateMachineSource, originalSource);


    // Ensure the SlowAsyncFunction definition has been persisted to storage.
    storage.upsert(asyncFunction);

    // Return the SlowAsyncFunction instance.
    return asyncFunction;
});





// TODO: temp testing...
function tween(stateMachineSource: string, originalSource: string) {

    var stateMachine = eval('(' + stateMachineSource + ')');

    var steppableFunc: types.Steppable.Function = <any> ((...args) => {
        var steppable = new Steppable(stateMachine);
        steppable.state = { local: { arguments: args } };
        return steppable;
    });
    steppableFunc.stateMachine = stateMachine;

    return makeSlowAsyncFunction(steppableFunc, stateMachineSource, originalSource);
}









// TODO: doc...
function makeSlowAsyncFunction(steppableFunc: types.Steppable.Function, stateMachineSource: string, originalSource: string) {

    // Compile the details of the AsyncFunction definition based on the given bodyFunc.
    // TODO: optimise! SteppableFunction is VERY EXPENSIVE!!!
    //       - better: hash the original source instead of the steppableFunc source, and only make a new steppableFunc if the hash hasn't already been created.
    //var bodyFunc = _.isFunction(original) ? original : ???;
    //var originalSource = _.isString(original) ? original : ???;
    //var steppableFunc = SteppableFunction(bodyFunc, { yieldIdentifier: 'await', constIdentifier: '__const' });
    //var source = steppableFunc.body.toString();
    var asyncFunctionId: string = crypto.createHash('sha1').update(stateMachineSource).digest('hex').slice(0, 40);

    // Create the callable part of the SlowAsyncFunction object. When called, this function creates a new
    // SlowAsyncFunctionActivation object from the given SteppableFunction, and runs it to completion.
    var asyncFunction: types.SlowAsyncFunction = <any> ((...args) => {

        // TODO: Create a new SlowPromise to represent the eventual result of the operation...
        var deferred = SlowPromise.deferred();

        // Create a new SlowAsyncFunctionActivation object using the given arguments.
        // TODO: subclass Steppable so we have an runtime-identifiable prototype?
        var safa: types.SlowAsyncFunction.Activation = steppableFunc.apply(steppableFunc, args);

        // Add slow state to the SlowAsyncFunctionActivation instance.
        safa._slow = {
            type: 'SlowAsyncFunctionActivation',
            asyncFunction,
            state: safa.state,
            awaiting: SlowPromise.resolved(),
            resolve: deferred.resolve,
            reject: deferred.reject
        };

        // Persist the SlowAsyncFunctionActivation's initial state to the database.
        storage.upsert(safa);

        // Run the SlowAsyncFunctionActivation instance to completion, and return the promise of completion.
        runToCompletion(safa);
        return deferred.promise;
    });

    // Add a reference to the stateMachine to the SlowAsyncFunction.
    asyncFunction.stateMachine = steppableFunc.stateMachine;

    // Add slow state to the SlowAsyncFunction instance.
    asyncFunction._slow = {
        type: 'SlowAsyncFunction',
        id: asyncFunctionId,
        stateMachineSource,
        originalSource
    };

    // Return the SlowAsyncFunction instance.
    return asyncFunction;
}





// TODO: register slow object type with storage (for rehydration logic)
storage.registerType({
    type: 'SlowAsyncFunction',
    rehydrate: obj => {

        // TODO: clean up
        return tween(obj.stateMachineSource, obj.originalSource);
    }
});


// TODO: register slow object type with storage (for rehydration logic)
storage.registerType({
    type: 'SlowAsyncFunctionActivation',
    rehydrate: obj => {
        var safa: types.SlowAsyncFunction.Activation = <any> new Steppable(obj.asyncFunction.stateMachine);
        safa.state = obj.state;
        safa._slow = obj;
        return safa;
    }
});
