import types = require('types');
import SlowType = types.SlowObject.Type;
import makeCallableClass = require('../util/makeCallableClass');
import runToCompletion = require('./runToCompletion');
import storage = require('../storage/storage');
export = SlowAsyncFunctionActivationResumeNext;


/**
 * Creates a callable slow object that resumes the given slow async
 * function activation with the given value.
 */
var SlowAsyncFunctionActivationResumeNext = makeCallableClass({

    constructor: function (safa: types.SlowAsyncFunction.Activation) {
        this._slow = { type: SlowType.SlowAsyncFunctionActivationResumeNext, safa };
        storage.created(this);
    },

    call: <types.SlowAsyncFunction.Activation.ResumeNext> function (value) {
        runToCompletion(this._slow.safa, null, value);
    },

    bindThis: true
});
