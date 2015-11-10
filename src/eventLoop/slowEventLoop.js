var async = require('asyncawait/async');
var await = require('asyncawait/await');
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
function addExitHandler(handler) {
    exitHandlers.push(handler);
}
exports.addExitHandler = addExitHandler;
var exitHandlers = [];
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
        persistence.flush().then(function () {
            traverseAllEntries();
            isRunning = false;
            if (entries.length > 0) {
                runUntilEmpty();
            }
            else {
                finalize();
            }
        });
    }, 200);
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
var finalize = async(function () {
    await(persistence.flush());
    await(persistence.disconnect());
    exitHandlers.forEach(function (handler) { return handler(); });
    // TODO: other actions...?
});
//# sourceMappingURL=slowEventLoop.js.map