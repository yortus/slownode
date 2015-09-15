var makeCallableClass = require('../util/makeCallableClass');
var storage = require('../storage/storage');
/**
 * Create a SlowPromiseReject callable instance.
 * It may be called to reject the given promise with a reason.
 */
var SlowPromiseReject = makeCallableClass({
    // TODO: doc...
    constructor: function (promise) {
        // Add slow metadata to the resolve function.
        this.$slow = { type: 12 /* SlowPromiseReject */, promise: promise };
        // Synchronise with the persistent object graph.
        storage.created(this);
    },
    // TODO: doc...
    call: function (reason) {
        // As per spec, do nothing if promise's fate is already resolved.
        var promise = this.$slow.promise;
        if (promise.$slow.isFateResolved)
            return;
        // Indicate the promise's fate is now resolved.
        promise.$slow.isFateResolved = true;
        // Synchronise with the persistent object graph.
        storage.updated(promise);
        // Finally, reject the promise using its own private _reject method.
        promise._reject(reason);
    }
});
module.exports = SlowPromiseReject;
//// TODO: register slow object type with storage (for rehydration logic)
//storage.registerType({
//    type: SlowType.SlowPromiseRejectFunction,
//    dehydrate: (p: types.SlowPromise.RejectFunction, recurse: (obj) => any) => {
//        if (!p || !p.$slow || p.$slow.type !== SlowType.SlowPromiseRejectFunction) return;
//        var jsonSafeObject = _.mapValues(p.$slow, propValue => recurse(propValue));
//        return jsonSafeObject;
//    },
//    rehydrate: jsonSafeObject => {
//        return create(jsonSafeObject.promise, false);
//    }
//});
//# sourceMappingURL=slowPromiseReject.js.map