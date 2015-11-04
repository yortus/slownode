var assert = require('assert');
var EpochLog = (function () {
    function EpochLog() {
        // TODO: temp testing... remove this...
        this.id = String.fromCharCode(++ix);
        // TODO: temp testing...
        this.allTrackedObjects = new Set();
        this.updatedTrackedObjects = new Set();
        this.deletedTrackedObjects = new Set();
        this.nextId = 0;
    }
    EpochLog.prototype.created = function (slowObj) {
        assert(!this.allTrackedObjects.has(slowObj));
        this.ensureSlowObjectHasUniqueId(slowObj);
        //console.log('----CREATED ' + this.id + ':' + slowObj.$slow.kind + ':' + slowObj.$slow.id);
        this.allTrackedObjects.add(slowObj);
        this.updatedTrackedObjects.add(slowObj);
    };
    EpochLog.prototype.updated = function (slowObj) {
        // TODO: implement...
    };
    EpochLog.prototype.deleted = function (slowObj) {
        //console.log('----DELETED ' + this.id + ':' + slowObj.$slow.kind + ':' + slowObj.$slow.id);
        // TODO: implement...
    };
    EpochLog.prototype.flush = function () {
        // TODO: temp testing...
        //console.log('TODO: (' + this.id + ') FLUSH LOG');
    };
    // TODO: ...
    EpochLog.prototype.ensureSlowObjectHasUniqueId = function (obj) {
        obj.$slow.id = obj.$slow.id || "#" + ++this.nextId;
    };
    return EpochLog;
})();
// TODO: temp testing... remove this...
var ix = 'A'.charCodeAt(0) - 1;
module.exports = EpochLog;
//# sourceMappingURL=epochLog.js.map