exports.setTimeout = (function (callback, delay) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var entry = new TimerEvent(delay, callback, args);
    eventLoop.enqueue(entry);
    return entry;
});
exports.setTimeout.forEpoch = function (journal) {
    // TODO: ...
    return null;
};
// TODO: doc...
function clearTimeout() {
}
exports.clearTimeout = clearTimeout;
//# sourceMappingURL=slowTimers.js.map