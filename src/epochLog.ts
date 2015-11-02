import assert  = require('assert');
import SlowObject = require('./slowObject');
export = EpochLog;


class EpochLog {

    created(slowObj: SlowObject) {
        assert(!this.allTrackedObjects.has(slowObj));
        this.ensureSlowObjectHasUniqueId(slowObj);
console.log('----CREATED ' + slowObj.$slow.kind + ':' + slowObj.$slow.id);
        this.allTrackedObjects.add(slowObj);
        this.updatedTrackedObjects.add(slowObj);
    }

    updated(slowObj: SlowObject) {
        // TODO: implement...
    }

    deleted(slowObj: SlowObject) {
console.log('----DELETED ' + slowObj.$slow.kind + ':' + slowObj.$slow.id);
        // TODO: implement...
    }

    flush() {
        // TODO: temp testing...
        console.log('TODO: FLUSH LOG');
    }

    // TODO: ...
    private ensureSlowObjectHasUniqueId(obj: SlowObject) {
        obj.$slow.id = obj.$slow.id || `#${++this.nextId}`;
    }

    // TODO: temp testing...
    private allTrackedObjects = new Set<SlowObject>();
    private updatedTrackedObjects = new Set<SlowObject>();
    private deletedTrackedObjects = new Set<SlowObject>();
    private nextId = 0;
}
