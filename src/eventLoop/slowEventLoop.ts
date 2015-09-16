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
    return entry.id;
}


// TODO: doc...
export function clearTimeout(timeoutObject: Timer) {
    for (var i = 0; i < entries.length; ++i) {
        if (entries[i].id !== timeoutObject) continue;
        entries.splice(i, 1);
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
var entries: Entry[] = [];
var persistedEventLoop = {
    $slow: {
        type: SlowType.SlowEventLoop,
        id: '<EventLoop>',
        entries
    }
};


// TODO: temp testing needs work...
// Synchronise with the persistent object graph.
storage.created(persistedEventLoop);
global.setTimeout(runLoop, 200);


// TODO: doc...
const slowPollInterval = 200;


// TODO: doc... need to set this appropriately high after rehydrating the event loop
var nextId = 0;


// TODO: doc...
function runLoop() {

//// TODO: temp testing...
//process.stdout.write(`==================== EVENT LOOP FLUSH `);

    // TODO: if finished?... exit?
    if (entries.length === 0) {
//        console.log(`==================== EVENT LOOP EMPTY =========================`);
//        process.exit(0);
    }

    // TODO: traverse all entries once...
    var thisLoop = entries;
    entries = persistedEventLoop.$slow.entries = [];
    while (thisLoop.length > 0) {

//// TODO: temp testing...
//process.stdout.write(`.`);

        var entry = thisLoop.shift();
        switch (entry.event.type) {
            case EventType.TimerEvent:
                let ev = <TimerEvent> entry.event;
                if (Date.now() >= ev.due) {
                    entry.callback.apply(void 0, entry.arguments);
                }
                else {
                    entries.push(entry);
                }
                break;
            default:
                throw new Error(`Unhandled event type in entry: ${JSON.stringify(entry)}`);
        }
    }

//// TODO: temp testing...
//process.stdout.write(`\n`);


    // Synchronise with the persistent object graph.
    storage.updated(persistedEventLoop);

    // TODO: temp testing...
    storage.saveChanges();

    // TODO: prep for next run
    global.setTimeout(runLoop, slowPollInterval);
}





// Tell storage how to restore the slow event loop.
storage.registerSlowObjectFactory(SlowType.SlowEventLoop, $slow => {
    persistedEventLoop.$slow = <any> $slow;
    entries = persistedEventLoop.$slow.entries;
    return persistedEventLoop;
});
