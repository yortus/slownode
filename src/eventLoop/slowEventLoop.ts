

// TODO: doc... ???
global.setTimeout(runLoop, 200);


// TODO: doc...
// TODO: should return a token for use with clearTimeout
export function setTimeout(callback: Function, delay: number, ...args: any[]) {
    var entry: Entry = {
        event: <TimerEvent> {
            type: EventType.TimerEvent,
            due: Date.now() + delay
        },
        callback: callback,
        arguments: args
    }
    entries.push(entry);
    // TODO: return token...
}


// TODO: doc...
// TODO: should return a token for use with clearTimeout
export function setImmediate(callback: Function, ...args: any[]) {
    return setTimeout(callback, 0, args);
}


// TODO: doc...
var entries: Entry[] = [];


// TODO: doc...
const slowPollInterval = 200;


// TODO: doc...
interface Entry {
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
function runLoop() {

//// TODO: temp testing...
//process.stdout.write(`==================== EVENT LOOP FLUSH `);

    // TODO: traverse all entries once...
    var thisLoop = entries;
    entries = [];
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

    // TODO: persist state

    // TODO: if finished?... exit?
    if (entries.length === 0) {
        console.log(`==================== EVENT LOOP EMPTY =========================`);
//        process.exit(0);
    }

    // TODO: prep for next run
    global.setTimeout(runLoop, slowPollInterval);
}









// Tell storage how to restore the slow event loop.
//storage.registerSlowObjectFactory(SlowType.SlowPromise, $slow => {
//    var promise = new SlowPromise(null);
//    promise.$slow = <any> $slow;
//    return promise;
//});
