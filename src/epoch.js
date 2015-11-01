var SlowLog = require('./slowLog');
var setTimeout = require('./eventLoop/setTimeout');
var clearTimeout = require('./eventLoop/clearTimeout');
var Epoch = (function () {
    function Epoch() {
        this.slowLog = new SlowLog();
    }
    Epoch.prototype.setTimeout = function (callback, delay) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var timeoutObject = setTimeout.apply(void 0, [callback, delay].concat(args));
        timeoutObject.$slowLog =
            this.slowLog.capture(timeoutObject);
        return timeoutObject;
    };
    Epoch.prototype.clearTimeout = function (timeoutObject) {
        this.slowLog.release(timeoutObject);
        clearTimeout(timeoutObject);
    };
    return Epoch;
})();
module.exports = Epoch;
//# sourceMappingURL=epoch.js.map