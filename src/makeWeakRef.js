var storage = require('./storage/storage');
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