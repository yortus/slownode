import async = require('asyncawait/async');
import await = require('asyncawait/await');
import persistence = require('../persistence');


// TODO: doc... no knowledge of epochs/logs in here... Entry impls handle that


export interface Entry {

    // TODO: doc...
    isBlocked(): boolean;

    // TODO: doc...
    dispatch(): void;
}


// TODO: doc...
export function add(entry: Entry) {
    entries.push(entry);
    runUntilEmpty();
}


// TODO: doc...
export function remove(entry: Entry) {
    var i = entries.indexOf(entry);
    if (i === -1) throw new Error('entry not found');
    entries.splice(i, 1);
}


// TODO: doc...
export function addExitHandler(handler: Function) {
    exitHandlers.push(handler);
}
var exitHandlers: Function[] = [];


// TODO: doc...
var entries: Entry[] = [];


// TODO: doc...
var isRunning = false;


// TODO: doc... need error handling everywhere...
function runUntilEmpty() {
    if (isRunning) return;
    isRunning = true;
    setTimeout(() => {
        persistence.flush().then(() => {
            traverseAllEntries();
            isRunning = false;

            // TODO: need nextTick here b/c SlowPromise must use nextTick between promise settlement
            //       and calling handlers (which are where new slow event loop entries would be added).
            process.nextTick(() => {
                if (entries.length > 0) {
                    runUntilEmpty();
                }
                else {
                    finalize();
                }
            });
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


var finalize = async (() => {
    await (persistence.flush());
    await (persistence.disconnect());
    exitHandlers.forEach(handler => handler());
    // TODO: other actions...?
});
