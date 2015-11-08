import assert = require('assert');
import _ = require('lodash');
import SlowKind = require('../slowKind');
import persistence = require('../persistence');
import makeCallableClass = require('../util/makeCallableClass');
import shasum = require('../util/shasum');
import SteppableStateMachine = require('../steppables/steppableStateMachine');
import SteppableFunction = require('../steppables/steppableFunction');
import SlowPromise = require('../promises/slowPromise');
import SlowAsyncFunctionActivation = require('./slowAsyncFunctionActivation');
export = SlowAsyncFunction;


/**
 * Creates a SlowAsyncFunction instance. It may be called with or without `new`.
 * A slow async function is analogous to an ES7 async function, but with persistence.
 */
var SlowAsyncFunction = slowAsyncFunctionForEpoch(null);


// TODO: doc...
interface SlowAsyncFunctionStatic {

    /** Creates a new SlowAsyncFunction instance. */
    new(bodyFunc: Function, options?: Options): SlowAsyncFunction;

    /** Creates a new SlowAsyncFunction instance. */
    (bodyFunc: Function, options?: Options): SlowAsyncFunction;

    /** TODO: doc... */
    forEpoch(epochId: string): SlowAsyncFunctionStatic;
}


// TODO: doc...
interface SlowAsyncFunction {

    /** Calling the instance begins execution of the body function, and returns a promise of its outcome. */
    (...args): SlowPromise;

    /** INTERNAL holds the full state of the instance in serializable form. An equivalent instance may be 'rehydrated' from this data. */
    $slow: {
        kind: SlowKind;
        epochId: string;
        id: string;
        stateMachineSource: string;
        originalSource: string; // TODO: not needed in operation, but preserve for future debugging/sourcemap needs?
    };

    /** INTERNAL the state machine that is equivalent to the body function passed to the constructor. */
    stateMachine: SteppableStateMachine;
}


// TODO: doc...
interface Options {
    require?: (moduleId: string) => any;
}


// TODO: doc...
function slowAsyncFunctionForEpoch(epochId: string) {

    // TODO: caching... NB can use a normal obj now that key is a string
    cache = cache || <any> new Map();
    if (cache.has(epochId)) return cache.get(epochId);

    // Create a constructor function whose instances (a) are callable and (b) work with instanceof.
    var result: SlowAsyncFunctionStatic = <any> makeCallableClass({

        // Create a new SlowAsyncFunction instance that runs the given body function.
        constructor: function (bodyFunc: Function, options?: Options) {
            var self: SlowAsyncFunction = this;

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
            var steppableOptions = {
                pseudoYield: 'await',
                pseudoConst: '__const',
                require: options ? options.require : null
            };
            var steppableFunc = new SteppableFunction(bodyFunc, steppableOptions);
            self.stateMachine = steppableFunc.stateMachine;
            self.$slow = {
                kind: SlowKind.AsyncFunction,
                epochId: epochId,
                id: safid,
                stateMachineSource: steppableFunc.stateMachine.toString(),
                originalSource
            };

            // Cache this SlowAsyncFunction instance to save re-computing it again.
            asyncFunctionCache[safid] = self;

            // Synchronise with the persistent object graph.
            persistence.created(self);
        },

        // Calling the instance begins execution of the body function, and returns a promise of its outcome.
        call: function (...args: any[]): SlowPromise {

            // Create a new SlowPromise to represent the eventual result of the slow async operation.
            var deferred = SlowPromise.forEpoch(epochId).deferred();

            // Create a new SlowAsyncFunctionActivation instance to run the async operation.
            var safa = new SlowAsyncFunctionActivation(epochId, (<SlowAsyncFunction> this), deferred.resolve, deferred.reject, args); // TODO: must be log-bound SAFA!

            // Run the async operation to completion, and return a promise of the outcome.
            safa.runToCompletion(safa);
            return deferred.promise;
        }
    });

    // TODO: ...
    result.forEpoch = slowAsyncFunctionForEpoch;

    // TODO: caching...
    cache.set(epochId, result);
    return result;
}


/** Supports memoization of SlowAsyncFunction instances, which are immutable and expensive to compute. */
// TODO: when used?
// TODO: rename: instanceCache
var asyncFunctionCache: { [afid: string]: SlowAsyncFunction; } = {};


// TODO: doc... NB can use a normal obj now that key is a string
// TODO: rename: constructorCache
var cache: Map<string, SlowAsyncFunctionStatic>;
