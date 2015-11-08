var persistence = require('../persistence');
// TODO: doc...
function add(entry) {
    entries.push(entry);
    runUntilEmpty();
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
var entries = [];
// TODO: doc...
var isRunning = false;
// TODO: doc... need error handling everywhere...
function runUntilEmpty() {
    if (isRunning)
        return;
    isRunning = true;
    setTimeout(function () {
        processOneTick().then(function () {
            isRunning = false;
            if (entries.length > 0)
                runUntilEmpty();
        });
    }, 200);
}
// TODO: doc...
function processOneTick() {
    traverseAllEntries();
    return persistence.flush();
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