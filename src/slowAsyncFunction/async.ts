import assert = require('assert');
import Promise = require('bluebird');
import Types = require('slownode');
import SlowRoutineFunction = require('../slowRoutine/slowRoutineFunction');
export = async;


var async: Types.SlowAsyncFunction = <any> ((bodyFunc: Function) => {

    var sloroFunc = new SlowRoutineFunction(bodyFunc, { yieldIdentifier: 'await', constIdentifier: '__const' });

    var result = (...args) => {
        var sloro: Types.SlowRoutine = sloroFunc.apply(sloroFunc, args);
        return new Promise((resolve, reject) => {

            // Start executing...
            resume();

            // This is the async runner.
            function resume(error?, next?) {
                try {
                    var yielded = arguments.length !== 1 ? sloro.next(next) : sloro.throw(error);
                    if (yielded.done) {
                        resolve(yielded.value);
                        return;
                    }
                    var p: Promise<any> = yielded.value;
                    assert(p && typeof p.then === 'function', 'await: expected argument to be a Promise');
                    p.then(
                        result => resume(null, result),
                        error => resume(error)
                    );
                }
                catch (ex) {
                    reject(ex);
                    return;
                }
            }
        });
    };
    return result;
});
