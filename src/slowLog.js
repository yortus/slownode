var assert = require('assert');
var SlowLog = (function () {
    function SlowLog() {
        // TODO: temp testing...
        this.allTrackedObjects = new Set();
        this.updatedTrackedObjects = new Set();
        this.deletedTrackedObjects = new Set();
        this.nextId = 0;
    }
    // TODO: temp testing...
    SlowLog.prototype.capture = function (obj) {
        assert(obj.$slowLog == null);
        obj.$slowLog = this;
        assert(!this.allTrackedObjects.has(obj));
        this.ensureSlowObjectHasUniqueId(obj);
        console.log('----CAPTURE ' + obj.$slow.kind + ':' + obj.$slow.id);
        this.allTrackedObjects.add(obj);
        this.updatedTrackedObjects.add(obj);
    };
    SlowLog.prototype.update = function (obj) {
        // TODO: ...
        //throw 'Not implemented';
    };
    SlowLog.prototype.release = function (obj) {
        console.log('----RELEASE ' + obj.$slow.kind + ':' + obj.$slow.id);
        assert(obj.$slowLog === this);
        // TODO: ...
        //throw 'Not implemented';
    };
    // TODO: ...
    SlowLog.prototype.ensureSlowObjectHasUniqueId = function (obj) {
        obj.$slow.id = obj.$slow.id || "#" + ++this.nextId;
    };
    return SlowLog;
})();
module.exports = SlowLog;
//# sourceMappingURL=slowLog.js.map