export = makeWeakRef;
import types = require('types');
import SlowType = require('./slowType');
import storage = require('./storage/storage');


function makeWeakRef(obj: any) {
    obj.$slow = { type: SlowType.SlowWeakRef }
    storage.created(obj);
}


// Tell storage how to create a SlowWeakRef instance.
storage.registerSlowObjectFactory(SlowType.SlowWeakRef, $slow => {
    return null;
});
