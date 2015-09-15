

export function enqueue(entry: Entry) {
    events.push(entry);
}


export function dequeue(): Entry {
    return events.shift();
}


var events: Entry[] = [];


interface Entry {
    event: Event;
    callback: Function;
    arguments: any[];
}


interface Event {
    type: EventType;
    [other: string]: any;
}


const enum EventType {
    Timeout
}




// Tell storage how to restore the slow event loop.
//storage.registerSlowObjectFactory(SlowType.SlowPromise, $slow => {
//    var promise = new SlowPromise(null);
//    promise.$slow = <any> $slow;
//    return promise;
//});
