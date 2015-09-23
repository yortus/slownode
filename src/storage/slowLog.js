var storage = require('./storage');
var SlowLog = {
    created: function () {
        var objs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            objs[_i - 0] = arguments[_i];
        }
        return objs.forEach(storage.created);
    },
    updated: function () {
        var objs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            objs[_i - 0] = arguments[_i];
        }
        return objs.forEach(storage.updated);
    },
    deleted: function () {
        var objs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            objs[_i - 0] = arguments[_i];
        }
        return objs.forEach(storage.deleted);
    }
};
module.exports = SlowLog;
//# sourceMappingURL=slowLog.js.map