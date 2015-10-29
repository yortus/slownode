var eventLoop = require('./eventLoop');
/**
 * Cancels an event previously scheduled with setTimeout.
 * @param timeoutObject an opaque timer object that was returned by a previous call to setTimeout.
 */
function clearTimeout(timeoutObject) {
    eventLoop.remove(timeoutObject);
}
module.exports = clearTimeout;
//# sourceMappingURL=clearTimeout.js.map