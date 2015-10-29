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
    // Encode the given details in an event loop entry.
    var entry = {
        $slow: {
            due: Date.now() + delay,
            callback: callback,
            arguments: args
        }
    };
    // Enqueue the entry into the event loop.
    eventLoop.enqueue(entry);
    // Return the entry.
    return entry;
}
module.exports = setTimeout;
//# sourceMappingURL=setTimeout.js.map