import SlowObject = require('../slowObject');
export = EventLoopEntry;


interface EventLoopEntry extends SlowObject {

    // TODO: doc...
    isBlocked(): boolean;

    // TODO: doc...
    dispatch(): void;

    // TODO: doc...
    cancel(): void;

}
