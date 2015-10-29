import EventLoopEntry = require('./eventLoopEntry');
import eventLoop = require('./eventLoop');
export = setTimeout;


/**
 * Cancels an event previously scheduled with setTimeout.
 * @param timeoutObject an opaque timer object that was returned by a previous call to setTimeout.
 */
function clearTimeout(timeoutObject: EventLoopEntry) {
    eventLoop.remove(timeoutObject);
}
