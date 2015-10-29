import SlowKind = require('../slowKind');
import SlowLog = require('../slowLog');
import EventLoopEntry = require('./eventLoopEntry');
import eventLoop = require('./eventLoop');
export = setTimeout;


/**
 * Schedules `callback` to be called with the given `args` (if any) after `delay` milliseconds.
 * Returns an opaque timer object that may be passed to clearTimeout() to cancel the scheduled call.
 * @param callback the function to execute after the timeout.
 * @param delay the number of milliseconds to wait before calling the callback.
 * @param args the optional arguments to pass to the callback.
 */
function setTimeout(callback: Function, delay: number, ...args: any[]): EventLoopEntry {

    // Encode the given details in an event loop entry.
    var entry: EventLoopEntry = {
        $slow: {
            kind: SlowKind.EventLoopEntry,
            id: null,
            due: Date.now() + delay,
            callback: callback,
            arguments: args
        },
        $slowLog: null
    };

    // Enqueue the entry into the event loop.
    eventLoop.enqueue(entry);

    // Return the entry.
    return entry;
}
