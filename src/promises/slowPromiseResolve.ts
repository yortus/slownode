//import assert = require('assert');
//import _ = require('lodash');
import types = require('types');
import SlowType = types.SlowObject.Type;
import makeCallableClass = require('../util/makeCallableClass');
import standardResolutionProcedure = require('./standardResolutionProcedure');
import storage = require('../storage/storage');
export = SlowPromiseResolve;



/**
 * Create a SlowPromiseResolve callable instance.
 * It may be called to resolve the given promise with a value.
 */
var SlowPromiseResolve = <{ new(promise: types.SlowPromise): types.SlowPromise.Resolve; }> makeCallableClass({

    // TODO: doc...
    constructor: function (promise: types.SlowPromise) {

        // Add slow metadata to the resolve function.
        this.$slow = { type: SlowType.SlowPromiseResolve, promise };

        // Synchronise with the persistent object graph.
        storage.created(this);
    },

    // TODO: doc...
    call: function (value?: any) {

        // As per spec, do nothing if promise's fate is already resolved.
        var promise: types.SlowPromise = this.$slow.promise;
        if (promise.$slow.isFateResolved) return;

        // Indicate the promise's fate is now resolved.
        promise.$slow.isFateResolved = true;

        // Synchronise with the persistent object graph.
        storage.updated(promise);

        // Finally, resolve the promise using the standard resolution procedure.
        standardResolutionProcedure(promise, value);
    }
});





//// TODO: register slow object type with storage (for rehydration logic)
//storage.registerType({
//    type: SlowType.SlowPromiseResolveFunction,
//    dehydrate: (p: types.SlowPromise.ResolveFunction, recurse: (obj) => any) => {
//        if (!p || !p.$slow || p.$slow.type !== SlowType.SlowPromiseResolveFunction) return;
//        var jsonSafeObject = _.mapValues(p.$slow, propValue => recurse(propValue));
//        return jsonSafeObject;
//    },
//    rehydrate: jsonSafeObject => {
//        return create(jsonSafeObject.promise, false);
//    }
//});
