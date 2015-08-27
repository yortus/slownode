import assert = require('assert');
import _ = require('lodash');
import types = require('types');
import standardResolutionProcedure = require('./standardResolutionProcedure');
import storage = require('../storage/storage');


/**
 * Returns a new SlowPromiseResolveFunction instance.
 * This function may be used to resolve the given promise with a value.
 */
export function create(promise: types.SlowPromise) {

    // Create a function that resolves the given promise with the given value.
    var resolve: types.SlowPromise.ResolveFunction = <any> ((value?: any) => {

        // As per spec, do nothing if promise's fate is already resolved.
        if (promise._slow.isFateResolved) return;

        // Indicate the promise's fate is now resolved, and persist this change to the promise's state
        promise._slow.isFateResolved = true;
        storage.upsert(promise);

        // Finally, resolve the promise using the standard resolution procedure.
        standardResolutionProcedure(promise, value);
    });

    // Add slow metadata to the resolve function, and persist it.
    resolve._slow = { type: 'SlowPromiseResolveFunction', promise };
    storage.upsert(resolve);

    // Return the resolve function.
    return resolve;
}
