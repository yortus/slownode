import Promise = require("bluebird")
import Types = require("slownode-prev");
import settings = require('../settings');
import store = require("../store/index");
import deserialise = require("../slowFunction/deserialise");
/**
 * 
 * Implicit events when adding/removing listeners:
 * 'newListener'
 * 'removeListener'
 * 
 */


export function addListener(event: string, listener: (...args: any[]) => any, options?: Types.SlowOptions): Promise<boolean> {
    options = options || {};
    options.runAt = -1;
    var func: Types.SlowFunction = {
        body: listener,
        options: options
    };

    var listenRow: Types.Schema.EventListener = {
        topic: event,
        funcId: ""
    }

    return settings.connection.transaction(trx => {
        store
            .addFunction(func).transacting(trx)
            .then(() => listenRow.funcId = func.id)
            .then(() => store.addListener(listenRow).transacting(trx))
            .then(trx.commit)
            .catch(trx.rollback)
    })
        .then(() => true)
        .catch(err => false);
}

export function on(event: string, listener: (...args: any[]) => any, options?: Types.SlowOptions) {
    return addListener(event, listener, options);
}

export function once(event: string, listener: (...args: any[]) => any, options?: Types.SlowOptions) {
    options = options || {};
    options.runOnce = 1;

    return addListener(event, listener, options);
}

export function removeListener(event: string) {

}

export function removeListeners(event: string) {

}

export function listeners(event: string) {
    return store.getListeners(event);
}

export function emit(event: string, ...args: any[]): Promise<boolean> {
    var toFunc = (func: Types.Schema.Function) => {
        var fn = deserialise(func).body;
        return fn.apply(fn, args);
    }

    return listeners(event)
        .then(funcs => funcs.map(toFunc))
        .then(() =>true);
}