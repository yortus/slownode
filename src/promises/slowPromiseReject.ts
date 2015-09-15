//import assert = require('assert');
//import _ = require('lodash');
import types = require('types');
import SlowType = types.SlowObject.Type;
import makeCallableClass = require('../util/makeCallableClass');
import storage = require('../storage/storage');
export = SlowPromiseReject;


/**
 * Create a SlowPromiseReject callable instance.
 * It may be called to reject the given promise with a reason.
 */
var SlowPromiseReject = <{ new(promise: types.SlowPromise): types.SlowPromise.Reject; }> makeCallableClass({

    // TODO: doc...
    constructor: function (promise: types.SlowPromise) {

        // Add slow metadata to the resolve function.
        this._slow = { type: SlowType.SlowPromiseReject, promise };

        // Synchronise with the persistent object graph.
        storage.created(this);
    },

    // TODO: doc...
    call: function (reason?: any) {

        // As per spec, do nothing if promise's fate is already resolved.
        var promise: types.SlowPromise = this._slow.promise;
        if (promise._slow.isFateResolved) return;

        // Indicate the promise's fate is now resolved.
        promise._slow.isFateResolved = true;

        // Synchronise with the persistent object graph.
        storage.updated(promise);

        // Finally, reject the promise using its own private _reject method.
        promise._reject(reason);
    }
});





//// TODO: register slow object type with storage (for rehydration logic)
//storage.registerType({
//    type: SlowType.SlowPromiseRejectFunction,
//    dehydrate: (p: types.SlowPromise.RejectFunction, recurse: (obj) => any) => {
//        if (!p || !p._slow || p._slow.type !== SlowType.SlowPromiseRejectFunction) return;
//        var jsonSafeObject = _.mapValues(p._slow, propValue => recurse(propValue));
//        return jsonSafeObject;
//    },
//    rehydrate: jsonSafeObject => {
//        return create(jsonSafeObject.promise, false);
//    }
//});
