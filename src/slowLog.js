var storage = require('./storage/storage');
var SlowLog = (function () {
    function SlowLog() {
    }
    SlowLog.prototype.created = function () {
        var objs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            objs[_i - 0] = arguments[_i];
        }
        objs.forEach(storage.created);
    };
    SlowLog.prototype.updated = function () {
        var objs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            objs[_i - 0] = arguments[_i];
        }
        objs.forEach(storage.updated);
    };
    SlowLog.prototype.deleted = function () {
        var objs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            objs[_i - 0] = arguments[_i];
        }
        objs.forEach(storage.deleted);
    };
    SlowLog.prototype.saveChanges = function () {
        // TODO: temp testing...
        console.log('SAVE CHANGES');
        storage.saveChanges();
    };
    SlowLog.none = new SlowLog();
    return SlowLog;
})();
module.exports = SlowLog;
//# sourceMappingURL=slowLog.js.map