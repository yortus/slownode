import assert = require('assert');
import SlowObject = require('./slowObject');
export = SlowLog;


class SlowLog {

    // TODO: temp testing...
    capture(obj: SlowObject) {
        assert(obj.$slowLog == null);
        obj.$slowLog = this;
        assert(!this.allTrackedObjects.has(obj));
        this.ensureSlowObjectHasUniqueId(obj);
console.log('----CAPTURE ' + obj.$slow.kind + ':' + obj.$slow.id);
        this.allTrackedObjects.add(obj);
        this.updatedTrackedObjects.add(obj);
    }

    update(obj: SlowObject) {

        // TODO: ...
        //throw 'Not implemented';
    }

    release(obj: SlowObject) {
console.log('----RELEASE ' + obj.$slow.kind + ':' + obj.$slow.id);
        assert(obj.$slowLog === this);

        // TODO: ...
        //throw 'Not implemented';
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
