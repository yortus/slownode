import Types = require("slownode");
import async = require("asyncawait/async");
import await = require("asyncawait/await");
import Promise = require("bluebird");
import db = require("../knexConnection");
import slowAsyncFunction = require("../slowAsyncFunction/slowAsyncFunction");

class SlowPromise implements Types.SlowPromise {
    constructor(resolver: (resolve: Types.SlowAsyncFunction, reject: Types.SlowAsyncFunction) => void) {

        var slowResolver = slowAsyncFunction(resolver);
        
    }

    _id: number = 0;
    _functionId: number = 0;
    _state: Types.SlowPromiseState = Types.SlowPromiseState.Pending;
    _value: any;
    
    then = (fn: Types.SlowAsyncFunction) => {
        
        return this;
    }
}

function createResolve(slowPromise: SlowPromise) {
    
}

function createReject(slowPromise: SlowPromise) {
    return null;
}