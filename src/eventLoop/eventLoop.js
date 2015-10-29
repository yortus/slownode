var flushLogs = require('../flushLogs');
// TODO: doc...
function enqueue(entry) {
    entries.push(entry);
}
exports.enqueue = enqueue;
// TODO: doc...
function remove(entry) {
    for (var i = 0; i < entries.length; ++i) {
        if (entries[i] !== entry)
            continue;
        entries.splice(i, 1);
        break;
    }
}
exports.remove = remove;
// TODO: doc...
var entries = [];
// TODO: doc...
runLoopForever();
// TODO: doc...
function runLoopForever() {
    var timer = setInterval(function () {
        traverseAllEntries();
        // Now is a good time to ensure that the persistent object graph has been flushed to storage.
        // At this point, we know we are about to yield to node's event loop. We want to be sure that
        // the persistent object graph has been safely flushed to storage, in case the process dies
        // between now and the next slow tick. In that case, then when the process is restarted, we
        // can pick up where we left off by reloading the persisted state.
        // TODO: review above policy. Good enough? Pros/cons of more/less frequent persisting:
        // - could persist on every created/updated/deleted, but then it must be a sync operation.
        // - only persisting just before yielding means that saveChanges can be made an async operation.
        // - more frequent means less chance of invalid/stale persisted state
        // - less frequent means going back to state before current tick was processed. Implications?
        // - a bug-related crash will most likely occur during tick processing
        // - an unrelated shutdown/restart will most likely occur during a sleep between ticks (statistically)
        flushLogs();
        // TODO: temp testing...
        // Use setImmediate so that if anything trigerred in the last traversal used nextTick or setImmediate
        // to enqueue another entry, then that enqueuing will have happened before the below check.
        setImmediate(function () {
            if (entries.length === 0)
                clearInterval(timer);
        });
    }, 200);
}
// TODO: doc...
function traverseAllEntries() {
    // TODO: traverse all entries once...
    var remaining = entries.length;
    while (--remaining >= 0) {
        var entry = entries.shift();
        // TODO: we only handle a single event type so far.... May need a 'type' property later?
        if (entry.$slow.due >= Date.now()) {
            // Not due yet - add it back to the queue and continue...
            entries.push(entry);
            continue;
        }
        else {
            // Entry is due! Log the state change, and run the callback in the entry.
            entry.$slow.callback.apply(void 0, entry.$slow.arguments);
        }
    }
}
//# sourceMappingURL=eventLoop.js.map