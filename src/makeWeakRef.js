var storage = require('./storage/storage');
/**
 * Marks the given object as a weak-referenced slow object. WeakRefs are serializable
 * regardless of what they contain, however they are effectively serialized as `null`.
 * Therefore, code using WeakRefs must always check for null before dereferencing them,
 * as they may become null between every tick of the slow event loop, due to the
 * possibility of the process stopping and restarting, and the epoch hence resuming
 * with rehydrated slow objects.
 * @param obj the object to mark as a weak-referenced slow object. It must be an object type.
 */
function makeWeakRef(obj) {
    obj.$slow = { type: 60 /* SlowWeakRef */ };
    storage.created(obj);
}
// Tell storage how to create a SlowWeakRef instance.
storage.registerSlowObjectFactory(60 /* SlowWeakRef */, function ($slow) {
    return null;
});
module.exports = makeWeakRef;
//# sourceMappingURL=makeWeakRef.js.map