import assert = require('assert');
import SlowLog = require('./slowLog');
import setTimeout = require('./eventLoop/setTimeout');
import clearTimeout = require('./eventLoop/clearTimeout');
import EventLoopEntry = require('./eventLoop/eventLoopEntry');
export = Epoch;


class Epoch {

    constructor() {
        this.slowLog = new SlowLog();
    }

    setTimeout(callback: Function, delay: number, ...args: any[]) {
        var timeoutObject = setTimeout(callback, delay, ...args);
        timeoutObject.$slowLog = 
        this.slowLog.capture(timeoutObject);
        return timeoutObject;
    }

    clearTimeout(timeoutObject: EventLoopEntry) {
        this.slowLog.release(timeoutObject);
        clearTimeout(timeoutObject);
    }

    private slowLog: SlowLog;
}
