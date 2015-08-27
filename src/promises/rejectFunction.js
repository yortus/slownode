var storage = require('../storage/storage');
/**
 * Returns a new SlowPromiseRejectFunction instance.
 * This function may be used to reject the given promise with a reason.
 */
function create(promise) {
    // Create a function that rejects the given promise with the given reason.
    var reject = (function (reason) {
        // As per spec, do nothing if promise's fate is already resolved.
        if (promise._slow.isFateResolved)
            return;
        // Indicate the promise's fate is now resolved, and persist this change to the promise's state
        promise._slow.isFateResolved = true;
        storage.upsert(promise);
        // Finally, reject the promise using its own private _reject method.
        promise._reject(reason);
    });
    // Add slow metadata to the reject function, and persist it.
    reject._slow = { type: 'SlowPromiseRejectFunction', promise: promise };
    storage.upsert(reject);
    // Return the reject function.
    return reject;
}
exports.create = create;
//# sourceMappingURL=rejectFunction.js.map