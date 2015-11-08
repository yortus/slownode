//import assert  = require('assert');
//import fs = require('fs');
//import _ = require('lodash');
//import SlowKind = require('../slowKind');
//import SlowObject = require('../slowObject');
//import dehydrateSlowObject = require('./dehydrateSlowObject');
//export = EpochLog;
//class EpochLog {
//    constructor(path: string, flags: string) {
//        // TODO: doc...
//        assert(flags === 'ax' || flags === 'a+');
//        // TODO: open the log file...
//        this.fd = fs.openSync(path, flags);
//        // TODO: if the file already exists, load entries from it...
//    }
//    // TODO: temp testing... remove this...
//    id = String.fromCharCode(++ix);
//    created(slowObj: SlowObject) {
//        assert(!this.allTrackedObjects.has(slowObj));
//        this.ensureSlowObjectHasUniqueId(slowObj);
//        this.allTrackedObjects.add(slowObj);
//        this.updatedTrackedObjects.add(slowObj);
//        // TODO: was... console.log('----CREATED ' + this.id + ':' + slowObj.$slow.kind + ':' + slowObj.$slow.id);
//    }
//    updated(slowObj: SlowObject) {
//        assert(this.allTrackedObjects.has(slowObj));
//        this.updatedTrackedObjects.add(slowObj);
//        // TODO: was... console.log('----UPDATED ' + this.id + ':' + slowObj.$slow.kind + ':' + slowObj.$slow.id);
//    }
//    deleted(slowObj: SlowObject) {
//        assert(this.allTrackedObjects.has(slowObj));
//        this.deletedTrackedObjects.add(slowObj);
//        // TODO: was... console.log('----DELETED ' + this.id + ':' + slowObj.$slow.kind + ':' + slowObj.$slow.id);
//    }
//    flush() {
//        // TODO: temp testing...
////console.log('TODO: (' + this.id + ') FLUSH LOG');
//        // For each deleted object, mark it as deleted in the log, and remove it from the set of tracked objects.
//        this.deletedTrackedObjects.forEach(obj => {
//            log(this.fd, `["${obj.$slow.id}", null],\n\n\n`);
//            this.allTrackedObjects.delete(obj);
//        });
//        // For each updated object, dehydrate it and write its serialized form to the log.
//        this.updatedTrackedObjects.forEach(obj => {
//            var jsonSafe = dehydrateSlowObject(obj, this.allTrackedObjects);
//            log(this.fd, `["${obj.$slow.id}", ${JSON.stringify(jsonSafe)}],\n\n\n`);
//        });
//        // Clear the deleted and updated sets.
//        this.deletedTrackedObjects.clear();
//        this.updatedTrackedObjects.clear();
//        // TODO: catch all possible errors! Must be robust! errors => slow.unhandledException
//    }
//    // TODO: ...
//    private ensureSlowObjectHasUniqueId(obj: SlowObject) {
//        obj.$slow.id = obj.$slow.id || `#${++this.nextId}`;
//    }
//    // TODO: temp testing...
//    private fd: number;
//    private allTrackedObjects = new Set<SlowObject>();
//    private updatedTrackedObjects = new Set<SlowObject>();
//    private deletedTrackedObjects = new Set<SlowObject>();
//    private nextId = 0;
//}
//// TODO: temp testing... remove this...
//var ix = 'A'.charCodeAt(0) - 1;
//// TODO: make async...
//function log(fd: number, s: string) {
//    (<any> fs.writeSync)(fd, s, null, 'utf8');
//    fs.fsyncSync(fd);
//}
//// TODO: temp testing copied from storage.ts
//var isLoadingState = false;
//export function loadState(storageLocation: string) {
//    // TODO: why not just allow tracking always? At load time that will effectively get the next log into the proper state....
//    isLoadingState = true;
//    // Read and parse the whole log file into an object.
//    // TODO: temp testing...
//    //var json = `[${fs.readFileSync(path.join(__dirname, '../../slowlog.bak.txt'), 'utf8')} 0]`;
//    //TODO: was restore...
//    var fileExists = exists(storageLocation);
//    var json = fileExists ? `[${fs.readFileSync(storageLocation, 'utf8')} 0]` : `[0]`;
//    var log: Array<[string,SlowObject]> = JSON.parse(json);
//    log.pop();
//    // TODO: at this point we can start the new log file.
//    //       - but ensure the old one is safely reloaded before deleting it!!!
//    // TODO: delete the old file for now, but this is NOT SAFE! See prev comment.
//    if (fileExists) fs.unlinkSync(storageLocation);
//    // Collect each (still dehydrated) slow object that appears in the log, in its most recent state.
//    var dehydratedSlowObjects = log.reduce((map, keyVal) => {
//        if (keyVal[1]) map[keyVal[0]] = keyVal[1]; else delete map[keyVal[0]];
//        return map;
//    }, <{ [key: string]: SlowObject }> {});
//    // Further filter the slow objects to those that are transitively reachable from roots.
//    // There is only one root slow object: the slow event loop.
//    var rootSlowObjectIds = _.values<SlowObject>(dehydratedSlowObjects)
//        .filter(so => so.$slow.kind === SlowKind.Timer) // TODO: extract function - should be *any* SlowKind that is an event loop entry (only Timer for now)
//        .map(so => so.$slow.id);
//    var reachableSlowObjectIds = new Set(rootSlowObjectIds);
//    var reachableObjects = rootSlowObjectIds.reduce((objs, id) => objs.concat(_.values(dehydratedSlowObjects[id].$slow)), []);
//    while (reachableObjects.length > 0) {
//        var reachableObject = reachableObjects.pop();
//        if (_.isArray(reachableObject)) {
//            reachableObjects = reachableObjects.concat(reachableObject);
//        }
//        else if (_.isPlainObject(reachableObject)) {
//            var $ref = reachableObject.$ref;
//            if ($ref) {
//                if (!reachableSlowObjectIds.has($ref)) {
//                    reachableSlowObjectIds.add($ref);
//                    reachableObjects = reachableObjects.concat(_.values(dehydratedSlowObjects[$ref].$slow));
//                }
//            }
//            else {
//                var $type = reachableObject.$type;
//                assert($type);
//                if ($type === 'object') {
//                    reachableObjects = reachableObjects.concat(reachableObject.value);
//                }
//            }
//        }
//    }
//    _.keys(dehydratedSlowObjects).forEach(id => {
//        if (!reachableSlowObjectIds.has(id)) delete dehydratedSlowObjects[id];
//    });
//    // Set nextId to the highest-used id#
//    nextId = _.keys(dehydratedSlowObjects).reduce((max, id) => Math.max(max, id[0] === '#' ? parseInt(id.slice(1)) : 0), 0);
//    // Rehydrate all the slow objects. This also reconnects cross-references (including cycles).
//    // TODO: doc/revise - (1) rehydrated objects may be null (eg weak refs). (2) If they have a $slow.id, it must be same as dehydrated one.
//    var rehydratedSlowObjects: typeof dehydratedSlowObjects = {};
//    _.forEach(dehydratedSlowObjects, dehydrated => {
//        var rehydrated = rehydrateSlowObject(dehydrated, rehydratedSlowObjects, slowObjectFactories);
//        rehydratedSlowObjects[dehydrated.$slow.id] = rehydrated;
//    });
//    // TODO: temp testing
//    isLoadingState = false;
//    // TODO: Add all the slow objects preserved from the old log to the new log
//    _.forEach(rehydratedSlowObjects, obj => {
//        // TODO: for weakrefs - they may rehydrate to null - need cleaner code for this 'exception'?
//        if (!obj) return;
//        // TODO: temp hack for early-created singleton event loop. Fix this!
//        if (obj.$slow.id === '<EventLoop>') return;
//        created(obj);
//    });
//}
//function exists(path: string) {
//    // Check if the logFile already exists. Use fs.stat since fs.exists is deprecated.
//    var result = true;
//    try { fs.statSync(path); } catch (ex) { result = false; }
//    return result;
//}
//# sourceMappingURL=epochLog.js.map