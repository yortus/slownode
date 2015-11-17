var vm = require('vm');
var persistence = require('../persistence');
var isRelocatableFunction = require('../util/isRelocatableFunction');
var slowEventLoop = require('./slowEventLoop');
// TODO: doc...
function createSetTimeoutFunction(epoch) {
    return function setTimeout(callback, delay) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var timer = new Timer(epoch, delay, callback, args);
        slowEventLoop.add(timer);
        return timer;
    };
}
exports.createSetTimeoutFunction = createSetTimeoutFunction;
// TODO: doc...
function clearTimeout(timeoutObject) {
    timeoutObject.cancel();
}
exports.clearTimeout = clearTimeout;
// TODO: doc...
var Timer = (function () {
    function Timer(epoch, delay, callback, args) {
        var _this = this;
        if (!isRelocatableFunction(callback)) {
            throw new Error("Timer: callback is not a relocatable function: " + (callback || '[null]').toString() + ".");
        }
        this.$slow = {
            kind: 100 /* Timer */,
            epochId: 'temp',
            id: null,
            due: Date.now() + delay,
            code: callback.toString(),
            arguments: args
        };
        persistence.created(this);
        this.dispatch = function () {
            persistence.deleted(_this);
            var closure = vm.runInContext('(' + _this.$slow.code + ')', epoch);
            closure.apply(null, args);
        };
    }
    Timer.prototype.isBlocked = function () {
        return this.$slow.due > Date.now();
    };
    Timer.prototype.cancel = function () {
        persistence.deleted(this);
        slowEventLoop.remove(this);
    };
    return Timer;
})();
exports.Timer = Timer;
// TODO: ==================== rehydration logic... temp testing... ====================
persistence.howToRehydrate(100 /* Timer */, function ($slow, epoch) {
    var timer = new Timer(epoch, 0, function () { }, []);
    timer.$slow = $slow;
    return timer;
});
//# sourceMappingURL=slowTimers.js.map