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
function setTimeout(callback: Function, delay: number, ...args: any[]) {
    var entry = new TimerEvent(delay, callback, args);
    eventLoop.enqueue(entry);
    return entry;
}


// TODO: doc...
class TimerEvent implements EventLoopEntry {

    constructor(delay: number, callback: Function, args: any[]) {
        this.$slow = {
            kind: SlowKind.EventLoopEntry,
            id: null,
            due: Date.now() + delay,
            callback: callback,
            arguments: args
        };
    }

    isBlocked() {
        return this.$slow.due > Date.now();
    }

    dispatch() {
        this.$slowLog.release(this);
        this.$slow.callback.apply(void 0, this.$slow.arguments);
    }

    cancel() {
        this.$slowLog.release(this);
        eventLoop.remove(this);
    }

    $slow: {
        kind: SlowKind;
        id: string;
        due: number;
        callback: Function;
        arguments: any[];
    };

    $slowLog: SlowLog;
}
