import assert = require('assert');
import _ = require('lodash');
import types = require('types');
import SlowType = types.SlowObject.Type;
import makeCallableClass = require('../util/makeCallableClass');
import shasum = require('../util/shasum');
import SteppableFunction = require('../functions/steppableFunction');
import SteppableObject = require('../functions/steppableObject');
import SlowPromise = require('../promises/slowPromise');
import SlowAsyncFunctionActivation = require('./slowAsyncFunctionActivation');
import runToCompletion = require('./runToCompletion');
import storage = require('../storage/storage');
export = SlowAsyncFunction;



/** Creates a slow async function instance. */
var SlowAsyncFunction: types.SlowAsyncFunctionStatic = <any> makeCallableClass({

    constructor: function (bodyFunc: Function) {

        // Validate arguments.
        assert(typeof bodyFunc === 'function');

        // Get the shasum of the body function's source code. This is used
        // to uniquely identify the SlowAsyncFunction for caching purposes.
        var originalSource = bodyFunc.toString();
        var safid = shasum(originalSource);

        // Return the cached SlowAsyncFunction instance immediately if there is one.
        var cached = asyncFunctionCache[safid];
        if (cached) return cached;

        // Create a new SlowAsyncFunction instance.
        var steppableFunc = new SteppableFunction(bodyFunc, { pseudoYield: 'await', pseudoConst: '__const' });
        this.stateMachine = steppableFunc.stateMachine;
        this.$slow = {
            type: SlowType.SlowAsyncFunction,
            id: safid,
            stateMachineSource: steppableFunc.stateMachine.toString(),
            originalSource
        };

        // Cache this SlowAsyncFunction instance to save re-computing it again.
        asyncFunctionCache[safid] = this;

        // Synchronise with the persistent object graph.
        storage.created(this);
    },

    call: function (...args): types.SlowPromise {

        // Create a new SlowPromise to represent the eventual result of the slow async operation.
        var deferred = SlowPromise.deferred();

        // Create a new SlowAsyncFunctionActivation instance to run the async operation.
        var safa = new SlowAsyncFunctionActivation(this.stateMachine, args, this, deferred);

        // Run the async operation to completion, and return a promise of the outcome.
        runToCompletion(safa);
        return deferred.promise;
    }
});


/** Supports memoization of SlowAsyncFunction instances, which are immutable and expensive to compute. */
var asyncFunctionCache: { [afid: string]: types.SlowAsyncFunction; } = {};


// Tell storage how to create a SlowAsyncFunction instance.
storage.registerSlowObjectFactory(SlowType.SlowAsyncFunction, $slow => {
    var saf = new SlowAsyncFunction(() => {});
    saf.$slow = <any> $slow;
    saf.stateMachine = eval(`(${saf.$slow.stateMachineSource})`);
    return saf;
});
