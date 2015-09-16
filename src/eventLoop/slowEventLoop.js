var storage = require('../storage/storage');
// TODO: doc...
// TODO: should return a token for use with clearTimeout
function setTimeout(callback, delay) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
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
    return entry.id;
}
exports.setTimeout = setTimeout;
// TODO: doc...
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
// TODO: doc...
// TODO: should return a token for use with clearTimeout
function setImmediate(callback) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return setTimeout(callback, 0, args);
}
exports.setImmediate = setImmediate;
// TODO: doc...
function clearImmediate(immediateObject) {
    return clearTimeout(immediateObject);
}
exports.clearImmediate = clearImmediate;
// TODO: doc...
console.log("==================== EVENT LOOP INITS");
global['slowEventLoopEntries'] = global['slowEventLoopEntries'] || [];
var entries = global['slowEventLoopEntries'];
var persistedEventLoop = {
    $slow: {
        type: 1 /* SlowEventLoop */,
        id: '<EventLoop>',
        entries: entries
    }
};
// TODO: temp testing needs work...
// Synchronise with the persistent object graph.
storage.created(persistedEventLoop);
global.setTimeout(runLoop, 200);
// TODO: doc...
var slowPollInterval = 200;
// TODO: doc... need to set this appropriately high after rehydrating the event loop
var nextId = 0;
// TODO: doc...
function runLoop() {
    //// TODO: temp testing...
    //process.stdout.write(`==================== EVENT LOOP FLUSH `);
    // TODO: if finished?... exit?
    if (entries.length === 0) {
    }
    // TODO: traverse all entries once...
    var remaining = entries.length;
    while (--remaining >= 0) {
        //// TODO: temp testing...
        //process.stdout.write(`.`);
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
    //// TODO: temp testing...
    //process.stdout.write(`\n`);
    // TODO: temp testing...
    storage.saveChanges();
    // TODO: prep for next run
    global.setTimeout(runLoop, slowPollInterval);
}
// Tell storage how to restore the slow event loop.
storage.registerSlowObjectFactory(1 /* SlowEventLoop */, function ($slow) {
    entries.push.apply(entries, $slow.entries);
    return persistedEventLoop;
});
//# sourceMappingURL=slowEventLoop.js.map