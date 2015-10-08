import assert = require('assert');
import _ = require('lodash');
import SlowKind = require('../slowKind');
import SlowLog = require('../slowLog');
import makeCallableClass = require('../util/makeCallableClass');
import shasum = require('../util/shasum');
import SteppableStateMachine = require('../steppables/steppableStateMachine');
import SteppableFunction = require('../steppables/steppableFunction');
import SlowPromise = require('../promises/slowPromise');
import SlowAsyncFunctionActivation = require('./slowAsyncFunctionActivation');
import storage = require('../storage/storage');
export = SlowAsyncFunction;


/**
 * Creates a SlowAsyncFunction instance. It may be called with or without `new`.
 * A slow async function is analogous to an ES7 async function.
 */
var SlowAsyncFunction: {

    /** Creates a new SlowAsyncFunction instance. */
    new(bodyFunc: Function): SlowAsyncFunction;

    /** Creates a new SlowAsyncFunction instance. */
    (bodyFunc: Function): SlowAsyncFunction;

    /** INTERNAL the SlowLog used by all instances created by this constructor. */
    $slowLog: SlowLog;
}
interface SlowAsyncFunction {

    /** Calling the instance begins execution of the body function, and returns a promise of its outcome. */
    (...args): SlowPromise;

    /** INTERNAL holds the full state of the instance in serializable form. An equivalent instance may be 'rehydrated' from this data. */
    $slow: {
        kind: SlowKind;
        id?: string;
        stateMachineSource: string;
        originalSource: string; // TODO: not needed in operation, but preserve for future debugging/sourcemap needs?
    };

    /** INTERNAL the state machine that is equivalent to the body function passed to the constructor. */
    stateMachine: SteppableStateMachine;
}


// Create a constructor function whose instances (a) are callable and (b) work with instanceof.
SlowAsyncFunction = <any> makeCallableClass({

    // Create a new SlowAsyncFunction instance that runs the given body function.
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
            kind: SlowKind.AsyncFunction,
            id: safid,
            stateMachineSource: steppableFunc.stateMachine.toString(),
            originalSource
        };

        // Cache this SlowAsyncFunction instance to save re-computing it again.
        asyncFunctionCache[safid] = this;

        // Synchronise with the persistent object graph.
        storage.created(this);
    },

    // Calling the instance begins execution of the body function, and returns a promise of its outcome.
    call: function (...args: any[]): SlowPromise {

        // Create a new SlowPromise to represent the eventual result of the slow async operation.
        var deferred = SlowPromise.deferred();

        // Create a new SlowAsyncFunctionActivation instance to run the async operation.
        var safa = new SlowAsyncFunctionActivation(this, deferred.resolve, deferred.reject, args); // TODO: must be log-bound SAFA!

        // Run the async operation to completion, and return a promise of the outcome.
        safa.runToCompletion(safa);
        return deferred.promise;
    }
});


// Set the static '$slowLog' property on the SlowAsyncFunction callable class.
SlowAsyncFunction.$slowLog = SlowLog.none;


/** Supports memoization of SlowAsyncFunction instances, which are immutable and expensive to compute. */
var asyncFunctionCache: { [afid: string]: SlowAsyncFunction; } = {};


// Tell storage how to create a SlowAsyncFunction instance.
storage.registerSlowObjectFactory(SlowKind.AsyncFunction, $slow => {
    var saf = new SlowAsyncFunction(() => {});
    saf.$slow = <any> $slow;
    saf.stateMachine = eval(`(${saf.$slow.stateMachineSource})`);
    return saf;
});
