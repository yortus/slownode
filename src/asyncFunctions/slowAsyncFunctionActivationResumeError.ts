import types = require('types');
import SlowType = types.SlowObject.Type;
import makeCallableClass = require('../util/makeCallableClass');
import runToCompletion = require('./runToCompletion');
import storage = require('../storage/storage');
export = SlowAsyncFunctionActivationResumeError;


/**
 * Creates a callable slow object that throws the given error into
 * the given slow async function actvation.
 */
var SlowAsyncFunctionActivationResumeError = makeCallableClass({

    constructor: function (safa: types.SlowAsyncFunction.Activation) {
        this.$slow = { type: SlowType.SlowAsyncFunctionActivationResumeError, safa };
        storage.created(this);
    },

    call: <types.SlowAsyncFunction.Activation.ResumeError> function (error) {
        runToCompletion(this.$slow.safa, error);
    },

    bindThis: true
});


// Tell storage how to create a SlowAsyncFunctionActivationResumeError instance.
storage.registerSlowObjectFactory(SlowType.SlowAsyncFunctionActivationResumeError, $slow => {
    var resumeError = new SlowAsyncFunctionActivationResumeError(null);
    resumeError.$slow = <any> $slow;
    return resumeError;
});
