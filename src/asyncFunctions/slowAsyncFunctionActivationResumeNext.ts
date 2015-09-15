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
        this.$slow = { type: SlowType.SlowAsyncFunctionActivationResumeNext, safa };
        storage.created(this);
    },

    call: <types.SlowAsyncFunction.Activation.ResumeNext> function (value) {
        runToCompletion(this.$slow.safa, null, value);
    },

    bindThis: true
});


// Tell storage how to create a SlowAsyncFunctionActivationResumeNext instance.
storage.registerSlowObjectFactory(SlowType.SlowAsyncFunctionActivationResumeNext, $slow => {
    var resumeNext = new SlowAsyncFunctionActivationResumeNext(null);
    resumeNext.$slow = <any> $slow;
    return resumeNext;
});
