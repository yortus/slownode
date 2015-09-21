import types = require('types');
import Timer = types.EventLoop.Timer;
import Entry = types.EventLoop.Entry;
import TimerEvent = types.EventLoop.TimerEvent;
import EventType = types.EventLoop.EventType;
import SlowType = types.SlowObject.Type;
import storage = require('../storage/storage');


// TODO: doc...
// TODO: should return a token for use with clearTimeout
export function setTimeout(callback: Function, delay: number, ...args: any[]): Timer {
    var entry: Entry = {
        id: ++nextId,
        event: <TimerEvent> {
            type: EventType.TimerEvent,
            due: Date.now() + delay
        },
        callback: callback,
        arguments: args
    }
    entries.push(entry);

    // Synchronise with the persistent object graph.
    storage.updated(persistedEventLoop);
    // TODO: and save changes?

    // TODO: pump may have stopped; revive it if so...
    startOrContinuePumping();

    return entry.id;
}


// TODO: doc...
export function clearTimeout(timeoutObject: Timer) {
    for (var i = 0; i < entries.length; ++i) {
        if (entries[i].id !== timeoutObject) continue;
        entries.splice(i, 1);

        // Synchronise with the persistent object graph.
        storage.updated(persistedEventLoop);
        // TODO: and save changes?

        break;
    }
}


// TODO: doc...
// TODO: should return a token for use with clearTimeout
export function setImmediate(callback: Function, ...args: any[]): Timer {
    return setTimeout(callback, 0, args);
}


// TODO: doc...
export function clearImmediate(immediateObject: Timer) {
    return clearTimeout(immediateObject);
}


// TODO: doc...
console.log(`==================== EVENT LOOP INITS`);
global['slowEventLoopEntries'] = global['slowEventLoopEntries'] || [];
var entries: Entry[] = global['slowEventLoopEntries'];
var persistedEventLoop = {
    $slow: {
        type: SlowType.SlowEventLoop,
        id: '<EventLoop>',
        entries
    }
};


// TODO: doc...
const slowPollInterval = 200;


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
        return;
    }

    // TODO: traverse all entries once...
    var remaining = entries.length;
    while (--remaining >= 0) {
        var entry = entries.shift();

        // Synchronise with the persistent object graph.
        storage.updated(persistedEventLoop);

        switch (entry.event.type) {
            case EventType.TimerEvent:
                let ev = <TimerEvent> entry.event;
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
                throw new Error(`Unhandled event type in entry: ${JSON.stringify(entry)}`);
        }
    }

    // TODO: temp testing...
    storage.saveChanges();

    // TODO: prep for next run
    startOrContinuePumping();
}





// Tell storage how to restore the slow event loop.
storage.registerSlowObjectFactory(SlowType.SlowEventLoop, ($slow: any) => {
    entries.push.apply(entries, $slow.entries);
    return persistedEventLoop;
});
