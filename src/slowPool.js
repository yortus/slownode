var storage = require('./storage/storage');
var SlowPool = (function () {
    function SlowPool() {
    }
    SlowPool.prototype.created = function () {
        var objs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            objs[_i - 0] = arguments[_i];
        }
        objs.forEach(storage.created);
    };
    SlowPool.prototype.updated = function () {
        var objs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            objs[_i - 0] = arguments[_i];
        }
        objs.forEach(storage.updated);
    };
    SlowPool.prototype.deleted = function () {
        var objs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            objs[_i - 0] = arguments[_i];
        }
        objs.forEach(storage.deleted);
    };
    // TODO: ...
    // TODO: temp testing... how to handle this really?
    SlowPool.none = new SlowPool();
    return SlowPool;
})();
module.exports = SlowPool;
//# sourceMappingURL=slowPool.js.map