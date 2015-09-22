import SlowType = require('../slowType');
import storage = require('../storage/storage');


// TODO: temp testing...
interface EventLoop {
    $slow: {
        type: SlowType;
        id?: string;
        entries: Entry[];
    };
}

type Timer = number;

// TODO: doc...
interface Entry {
    id: number;
    event: Event;
    callback: Function;
    arguments: any[];
}

// TODO: doc...
interface Event {
    type: EventType;
    [other: string]: any;
}

// TODO: doc...
const enum EventType {
    TimerEvent
}

// TODO: doc...
interface TimerEvent extends Event {

    /** UNIX timestamp */
    due: number;
}






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
storage.registerSlowObjectFactory(SlowType.SlowEventLoop, ($slow: any) => {
    entries.push.apply(entries, $slow.entries);
    return persistedEventLoop;
});
