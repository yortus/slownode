var eventLoop = require('./eventLoop');
/**
 * Schedules `callback` to be called with the given `args` (if any) after `delay` milliseconds.
 * Returns an opaque timer object that may be passed to clearTimeout() to cancel the scheduled call.
 * @param callback the function to execute after the timeout.
 * @param delay the number of milliseconds to wait before calling the callback.
 * @param args the optional arguments to pass to the callback.
 */
function setTimeout(callback, delay) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var entry = new TimerEvent(delay, callback, args);
    eventLoop.enqueue(entry);
    return entry;
}
// TODO: doc...
var TimerEvent = (function () {
    function TimerEvent(delay, callback, args) {
        this.$slow = {
            kind: 1 /* EventLoopEntry */,
            id: null,
            due: Date.now() + delay,
            callback: callback,
            arguments: args
        };
    }
    TimerEvent.prototype.isBlocked = function () {
        return this.$slow.due > Date.now();
    };
    TimerEvent.prototype.dispatch = function () {
        this.$slowLog.release(this);
        this.$slow.callback.apply(void 0, this.$slow.arguments);
    };
    TimerEvent.prototype.cancel = function () {
        this.$slowLog.release(this);
        eventLoop.remove(this);
    };
    return TimerEvent;
})();
module.exports = setTimeout;
//# sourceMappingURL=setTimeout.js.map