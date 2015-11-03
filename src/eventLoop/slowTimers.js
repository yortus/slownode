var slowEventLoop = require('./slowEventLoop');
// TODO: doc...
exports.setTimeout = setTimeoutForEpoch(null);
// TODO: doc...
function clearTimeout(timeoutObject) {
    timeoutObject.cancel();
}
exports.clearTimeout = clearTimeout;
// TODO: doc...
var Timer = (function () {
    function Timer(epochLog, delay, callback, args) {
        this.epochLog = epochLog;
        this.$slow = {
            kind: 1 /* Timer */,
            id: null,
            due: Date.now() + delay,
            callback: callback,
            arguments: args
        };
    }
    Timer.prototype.isBlocked = function () {
        return this.$slow.due > Date.now();
    };
    Timer.prototype.dispatch = function () {
        this.epochLog.deleted(this);
        this.$slow.callback.apply(void 0, this.$slow.arguments);
    };
    Timer.prototype.cancel = function () {
        this.epochLog.deleted(this);
        slowEventLoop.remove(this);
    };
    return Timer;
})();
exports.Timer = Timer;
// TODO: doc...
function setTimeoutForEpoch(epochLog) {
    var result = (function (callback, delay) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var timer = new Timer(epochLog, delay, callback, args);
        epochLog.created(timer);
        slowEventLoop.add(timer);
        return timer;
    });
    result.forEpoch = setTimeoutForEpoch;
    return result;
}
//# sourceMappingURL=slowTimers.js.map