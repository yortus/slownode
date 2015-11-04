var assert = require('assert');
var fs = require('fs');
var dehydrateSlowObject = require('./dehydrateSlowObject');
var EpochLog = (function () {
    function EpochLog(path, flags) {
        // TODO: temp testing... remove this...
        this.id = String.fromCharCode(++ix);
        this.allTrackedObjects = new Set();
        this.updatedTrackedObjects = new Set();
        this.deletedTrackedObjects = new Set();
        this.nextId = 0;
        // TODO: doc...
        assert(flags === 'ax' || flags === 'a+');
        // TODO: open the log file...
        this.fd = fs.openSync(path, flags);
    }
    EpochLog.prototype.created = function (slowObj) {
        assert(!this.allTrackedObjects.has(slowObj));
        this.ensureSlowObjectHasUniqueId(slowObj);
        this.allTrackedObjects.add(slowObj);
        this.updatedTrackedObjects.add(slowObj);
        // TODO: was... console.log('----CREATED ' + this.id + ':' + slowObj.$slow.kind + ':' + slowObj.$slow.id);
    };
    EpochLog.prototype.updated = function (slowObj) {
        assert(this.allTrackedObjects.has(slowObj));
        this.updatedTrackedObjects.add(slowObj);
        // TODO: was... console.log('----UPDATED ' + this.id + ':' + slowObj.$slow.kind + ':' + slowObj.$slow.id);
    };
    EpochLog.prototype.deleted = function (slowObj) {
        assert(this.allTrackedObjects.has(slowObj));
        this.deletedTrackedObjects.add(slowObj);
        // TODO: was... console.log('----DELETED ' + this.id + ':' + slowObj.$slow.kind + ':' + slowObj.$slow.id);
    };
    EpochLog.prototype.flush = function () {
        // TODO: temp testing...
        //console.log('TODO: (' + this.id + ') FLUSH LOG');
        var _this = this;
        // For each deleted object, mark it as deleted in the log, and remove it from the set of tracked objects.
        this.deletedTrackedObjects.forEach(function (obj) {
            log(_this.fd, "[\"" + obj.$slow.id + "\", null],\n\n\n");
            _this.allTrackedObjects.delete(obj);
        });
        // For each updated object, dehydrate it and write its serialized form to the log.
        this.updatedTrackedObjects.forEach(function (obj) {
            var jsonSafe = dehydrateSlowObject(obj, _this.allTrackedObjects);
            log(_this.fd, "[\"" + obj.$slow.id + "\", " + JSON.stringify(jsonSafe) + "],\n\n\n");
        });
        // Clear the deleted and updated sets.
        this.deletedTrackedObjects.clear();
        this.updatedTrackedObjects.clear();
        // TODO: catch all possible errors! Must be robust! errors => slow.unhandledException
    };
    // TODO: ...
    EpochLog.prototype.ensureSlowObjectHasUniqueId = function (obj) {
        obj.$slow.id = obj.$slow.id || "#" + ++this.nextId;
    };
    return EpochLog;
})();
// TODO: temp testing... remove this...
var ix = 'A'.charCodeAt(0) - 1;
// TODO: make async...
function log(fd, s) {
    fs.writeSync(fd, s, null, 'utf8');
    fs.fsyncSync(fd);
}
module.exports = EpochLog;
//# sourceMappingURL=epochLog.js.map