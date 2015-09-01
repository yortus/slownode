import assert = require('assert');
import _ = require('lodash');
import types = require('types');
import SlowType = types.SlowObject.Type;
import standardResolutionProcedure = require('./standardResolutionProcedure');
import storage = require('../storage/storage');


/**
 * Returns a new SlowPromiseResolveFunction instance.
 * This function may be used to resolve the given promise with a value.
 */
export function create(promise: types.SlowPromise, persist = true) {

    // Create a function that resolves the given promise with the given value.
    var resolve: types.SlowPromise.ResolveFunction = <any> ((value?: any) => {

        // As per spec, do nothing if promise's fate is already resolved.
        if (promise._slow.isFateResolved) return;

        // Indicate the promise's fate is now resolved, and persist this change to the promise's state
        promise._slow.isFateResolved = true;
        storage.track(promise);

        // Finally, resolve the promise using the standard resolution procedure.
        standardResolutionProcedure(promise, value);
    });

    // Add slow metadata to the resolve function, and persist it.
    resolve._slow = { type: SlowType.SlowPromiseResolveFunction, promise };
    if (persist) storage.track(resolve);

    // Return the resolve function.
    return resolve;
}


// TODO: register slow object type with storage (for rehydration logic)
storage.registerType({
    type: SlowType.SlowPromiseResolveFunction,
    dehydrate: (p: types.SlowPromise.ResolveFunction, recurse: (obj) => any) => {
        if (!p || !p._slow || p._slow.type !== SlowType.SlowPromiseResolveFunction) return;
        var jsonSafeObject = _.mapValues(p._slow, propValue => recurse(propValue));
        return jsonSafeObject;
    },
    rehydrate: jsonSafeObject => {
        return create(jsonSafeObject.promise, false);
    }
});
