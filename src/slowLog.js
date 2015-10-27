var storage = require('./storage/storage');
var SlowLog = (function () {
    function SlowLog() {
    }
    SlowLog.prototype.created = function () {
        var objs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            objs[_i - 0] = arguments[_i];
        }
        // TODO: ...
        console.log('CREATE');
        objs.forEach(storage.created);
    };
    SlowLog.prototype.updated = function () {
        var objs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            objs[_i - 0] = arguments[_i];
        }
        // TODO: ...
        console.log('UPDATE');
        objs.forEach(storage.updated);
    };
    SlowLog.prototype.deleted = function () {
        var objs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            objs[_i - 0] = arguments[_i];
        }
        // TODO: ...
        console.log('DELETE');
        objs.forEach(storage.deleted);
    };
    SlowLog.none = new SlowLog();
    return SlowLog;
})();
module.exports = SlowLog;
//# sourceMappingURL=slowLog.js.map