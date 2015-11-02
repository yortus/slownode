﻿import assert = require('assert');
import EpochLog = require('./epochLog');
import slowTimers = require('./eventLoop/slowTimers');
import slowEventLoop = require('./eventLoop/slowEventLoop');
export = Epoch;


class Epoch {

    // TODO: take a filename
    constructor() {


        // TODO: need orderly attach/detach in pairs. This will never be detached!! And will keep ref to epoch/log alive!
        slowEventLoop.beforeNextTick.attach(() => {
            this.log.flush();
            return Promise.resolve<void>();
        });
    }

    // TODO: explicit disposal...

    // TODO: temp testing...
    private log = new EpochLog();

    // TODO: temp testing...
    setTimeout = slowTimers.setTimeout.forEpoch(this.log);

    // TODO: temp testing...
    clearTimeout = slowTimers.clearTimeout;

    // TODO: temp testing...
}
