import assert = require('assert');
import API = require('./index.d.ts'); // NB: elided ref (for types only)
import persistence = require('./persistence');
import Epoch = require('./epochs/epoch');
import slowEventLoop = require('./eventLoop/slowEventLoop');
export = api;


var api: typeof API = <any> {};


// TODO: ...
api.run = (epochId: string, code: Function, ...args: any[]): Epoch => {
    return new Epoch(epochId, code, ...args);
}


// TODO: ...
api.weakRef = (obj: any) => {
    persistence.weakRef(obj);
}


// TODO: ...
api.on = (eventId: string, handler: Function) => {
    assert(eventId === 'end');
    slowEventLoop.addExitHandler(handler);
}


// TODO: ...
api.Epoch = Epoch;


// TODO: temp testing
global['EPOCH'] = '<NO-EPOCH>';
