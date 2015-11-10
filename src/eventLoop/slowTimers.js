var persistence = require('../persistence');
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
    function Timer(epochId, delay, callback, args) {
        this.epochId = epochId;
        this.$slow = {
            kind: 100 /* Timer */,
            epochId: epochId,
            id: null,
            due: Date.now() + delay,
            callback: callback,
            arguments: args
        };
        persistence.created(this);
    }
    Timer.prototype.isBlocked = function () {
        return this.$slow.due > Date.now();
    };
    Timer.prototype.dispatch = function () {
        persistence.deleted(this);
        this.$slow.callback.apply(void 0, this.$slow.arguments);
    };
    Timer.prototype.cancel = function () {
        persistence.deleted(this);
        slowEventLoop.remove(this);
    };
    return Timer;
})();
exports.Timer = Timer;
// TODO: doc...
function setTimeoutForEpoch(epochId) {
    // TODO: caching... NB can use a normal obj now that key is a string
    cache = cache || new Map();
    if (cache.has(epochId))
        return cache.get(epochId);
    // TODO: ...
    var result = (function (callback, delay) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var timer = new Timer(epochId, delay, callback, args);
        slowEventLoop.add(timer);
        return timer;
    });
    result.forEpoch = setTimeoutForEpoch;
    // TODO: caching...
    cache.set(epochId, result);
    return result;
}
// TODO: ... NB can use a normal obj now that key is a string
var cache;
// TODO: ==================== rehydration logic... temp testing... ====================
persistence.howToRehydrate(100 /* Timer */, function ($slow) {
    var timer = setTimeoutForEpoch($slow.epochId)(null, 0);
    timer.$slow = $slow;
    return timer;
});
//# sourceMappingURL=slowTimers.js.map