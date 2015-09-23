var storage = require('../storage/storage');
/**
 * Schedules `callback` to be called with the given `args` (if any) after `delay` milliseconds.
 * Returns an opaque Timer object that may be passed to clearTimeout() to cancel the scheduled call.
 * @param callback the function to execute after the timeout.
 * @param delay the number of milliseconds to wait before calling the callback.
 * @param args the optional arguments to pass to the callback.
 */
function setTimeout(callback, delay) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    // TODO: ...
    var entry = {
        id: ++nextId,
        event: {
            type: 0 /* TimerEvent */,
            due: Date.now() + delay
        },
        callback: callback,
        arguments: args
    };
    entries.push(entry);
    // Synchronise with the persistent object graph.
    storage.updated(persistedEventLoop);
    // TODO: and save changes?
    // TODO: pump may have stopped; revive it if so...
    startOrContinuePumping();
    return entry.id;
}
exports.setTimeout = setTimeout;
/**
 * Cancels an event previously scheduled with setTimeout.
 * @param timeoutObject an opaque Timer object that was returned by a prior call to setTimeout.
 */
function clearTimeout(timeoutObject) {
    for (var i = 0; i < entries.length; ++i) {
        if (entries[i].id !== timeoutObject)
            continue;
        entries.splice(i, 1);
        // Synchronise with the persistent object graph.
        storage.updated(persistedEventLoop);
        // TODO: and save changes?
        break;
    }
}
exports.clearTimeout = clearTimeout;
/**
 * Schedules `callback` to be called with the given `args` (if any) on the next tick of the slow event loop.
 * Returns an opaque Timer object that may be passed to clearImmediate() to cancel the scheduled call.
 * @param callback the function to execute on the next tick of the slow event loop.
 * @param args the optional arguments to pass to the callback.
 */
function setImmediate(callback) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return setTimeout(callback, 0, args);
}
exports.setImmediate = setImmediate;
/**
 * Cancels an event previously scheduled with setImmediate.
 * @param timeoutObject an opaque Timer object that was returned by a prior call to setImmediate.
 */
function clearImmediate(immediateObject) {
    return clearTimeout(immediateObject);
}
exports.clearImmediate = clearImmediate;
// TODO: doc... fix...
global['slowEventLoopEntries'] = global['slowEventLoopEntries'] || [];
var entries = global['slowEventLoopEntries'];
var persistedEventLoop = {
    $slow: {
        kind: 1 /* EventLoop */,
        id: '<EventLoop>',
        entries: entries
    }
};
// TODO: doc...
var slowPollInterval = 200;
// TODO: doc... need to set this appropriately high after rehydrating the event loop
var nextId = 0;
// TODO: doc...
var isPumping = false;
// TODO: temp testing needs work...
// Synchronise with the persistent object graph.
storage.created(persistedEventLoop);
startOrContinuePumping();
function startOrContinuePumping() {
    if (!isPumping) {
        isPumping = true;
        global.setTimeout(runLoop, slowPollInterval);
    }
}
// TODO: doc...
function runLoop() {
    isPumping = false;
    // TODO: this will effectively stop pumping the loop when its empty. If's effectively dead and ended. Is this correct?
    if (entries.length === 0) {
        storage.saveChanges();
        return;
    }
    // TODO: traverse all entries once...
    var remaining = entries.length;
    while (--remaining >= 0) {
        var entry = entries.shift();
        // Synchronise with the persistent object graph.
        storage.updated(persistedEventLoop);
        switch (entry.event.type) {
            case 0 /* TimerEvent */:
                var ev = entry.event;
                if (Date.now() >= ev.due) {
                    entry.callback.apply(void 0, entry.arguments);
                }
                else {
                    entries.push(entry);
                    // Synchronise with the persistent object graph.
                    storage.updated(persistedEventLoop);
                }
                break;
            default:
                throw new Error("Unhandled event type in entry: " + JSON.stringify(entry));
        }
    }
    // TODO: review this policy. Good enough? Pros/cons of more/less frequent persisting:
    // - could persist on every created/updated/deleted, but then it must be a sync operation.
    // - only persisting just before yielding means that saveChanges can be made an async operation.
    // - more frequent means less chance of invalid/stale persisted state
    // - less frequent means going back to state before current tick was processed. Implications?
    // - a bug-related crash will most likely occur during tick processing
    // - an unrelated shutdown/restart will most likely occur during a sleep between ticks (statistically)
    // Now is a good time to ensure that the persistent object graph has been flushed to storage.
    // At this point, we know we are about to yield to node's event loop. We want to be sure that
    // the persistent object graph has been safely flushed to storage, in case the process dies
    // between now and the next slow tick. In that case, then when the process is restarted we,
    // can pick up where we left off by reloading the persisted state.
    storage.saveChanges();
    // TODO: prep for next run
    startOrContinuePumping();
}
// Tell storage how to restore the slow event loop.
storage.registerSlowObjectFactory(1 /* EventLoop */, function ($slow) {
    entries.push.apply(entries, $slow.entries);
    return persistedEventLoop;
});
//# sourceMappingURL=slowEventLoop.js.map