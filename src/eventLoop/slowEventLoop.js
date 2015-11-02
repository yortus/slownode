// TODO: doc... no knowledge of epochs/logs in here... Entry impls handle that
// TODO: doc...
function add(entry) {
    entries.push(entry);
}
exports.add = add;
// TODO: doc...
function remove(entry) {
    var i = entries.indexOf(entry);
    if (i === -1)
        throw new Error('entry not found');
    entries.splice(i, 1);
}
exports.remove = remove;
// TODO: doc...
exports.beforeNextTick = {
    attach: function (handler) {
        tickHandlers.push(handler);
    },
    detach: function (handler) {
        var i = tickHandlers.indexOf(handler);
        if (i === -1)
            throw new Error('entry not found');
        tickHandlers.splice(i, 1);
    }
};
var tickHandlers = [];
// TODO: doc...
var entries = [];
// TODO: doc...
runUntilEmpty();
// TODO: doc...
function runUntilEmpty() {
    setTimeout(function () {
        processOneTick().then(function () {
            if (entries.length > 0)
                runUntilEmpty();
        });
    }, 200);
}
// TODO: doc...
function processOneTick() {
    traverseAllEntries();
    return Promise.all(tickHandlers.map(function (handler) { return handler(); }));
}
// TODO: doc...
function traverseAllEntries() {
    // TODO: traverse all entries once...
    var remaining = entries.length;
    while (--remaining >= 0) {
        // Dequeue the next entry.
        var entry = entries.shift();
        // TODO: ...
        if (entry.isBlocked()) {
            // Entry is blocked - add it back to the queue without processing it.
            entries.push(entry);
            continue;
        }
        else {
            // Entry is runnable - dispatch it.
            entry.dispatch();
        }
    }
}
//# sourceMappingURL=slowEventLoop.js.map