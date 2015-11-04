import assert  = require('assert');
import fs = require('fs');
import SlowObject = require('../slowObject');
import dehydrateSlowObject = require('./dehydrateSlowObject');
export = EpochLog;


class EpochLog {

    constructor(path: string, flags: string) {

        // TODO: doc...
        assert(flags === 'ax' || flags === 'a+');


        // TODO: open the log file...
        this.fd = fs.openSync(path, flags);


    }

    // TODO: temp testing... remove this...
    id = String.fromCharCode(++ix);

    created(slowObj: SlowObject) {
        assert(!this.allTrackedObjects.has(slowObj));
        this.ensureSlowObjectHasUniqueId(slowObj);
        this.allTrackedObjects.add(slowObj);
        this.updatedTrackedObjects.add(slowObj);
        // TODO: was... console.log('----CREATED ' + this.id + ':' + slowObj.$slow.kind + ':' + slowObj.$slow.id);
    }

    updated(slowObj: SlowObject) {
        assert(this.allTrackedObjects.has(slowObj));
        this.updatedTrackedObjects.add(slowObj);
        // TODO: was... console.log('----UPDATED ' + this.id + ':' + slowObj.$slow.kind + ':' + slowObj.$slow.id);
    }

    deleted(slowObj: SlowObject) {
        assert(this.allTrackedObjects.has(slowObj));
        this.deletedTrackedObjects.add(slowObj);
        // TODO: was... console.log('----DELETED ' + this.id + ':' + slowObj.$slow.kind + ':' + slowObj.$slow.id);
    }

    flush() {
        // TODO: temp testing...
//console.log('TODO: (' + this.id + ') FLUSH LOG');


        // For each deleted object, mark it as deleted in the log, and remove it from the set of tracked objects.
        this.deletedTrackedObjects.forEach(obj => {
            log(this.fd, `["${obj.$slow.id}", null],\n\n\n`);
            this.allTrackedObjects.delete(obj);
        });

        // For each updated object, dehydrate it and write its serialized form to the log.
        this.updatedTrackedObjects.forEach(obj => {
            var jsonSafe = dehydrateSlowObject(obj, this.allTrackedObjects);
            log(this.fd, `["${obj.$slow.id}", ${JSON.stringify(jsonSafe)}],\n\n\n`);
        });

        // Clear the deleted and updated sets.
        this.deletedTrackedObjects.clear();
        this.updatedTrackedObjects.clear();

        // TODO: catch all possible errors! Must be robust! errors => slow.unhandledException


    }

    // TODO: ...
    private ensureSlowObjectHasUniqueId(obj: SlowObject) {
        obj.$slow.id = obj.$slow.id || `#${++this.nextId}`;
    }

    // TODO: temp testing...
    private fd: number;
    private allTrackedObjects = new Set<SlowObject>();
    private updatedTrackedObjects = new Set<SlowObject>();
    private deletedTrackedObjects = new Set<SlowObject>();
    private nextId = 0;
}


// TODO: temp testing... remove this...
var ix = 'A'.charCodeAt(0) - 1;





// TODO: make async...
function log(fd: number, s: string) {
    (<any> fs.writeSync)(fd, s, null, 'utf8');
    fs.fsyncSync(fd);
}
