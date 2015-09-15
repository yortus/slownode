var makeCallableClass = require('../util/makeCallableClass');
var runToCompletion = require('./runToCompletion');
var storage = require('../storage/storage');
/**
 * Creates a callable slow object that resumes the given slow async
 * function activation with the given value.
 */
var SlowAsyncFunctionActivationResumeNext = makeCallableClass({
    constructor: function (safa) {
        this.$slow = { type: 31 /* SlowAsyncFunctionActivationResumeNext */, safa: safa };
        storage.created(this);
    },
    call: function (value) {
        runToCompletion(this.$slow.safa, null, value);
    },
    bindThis: true
});
// Tell storage how to create a SlowAsyncFunctionActivationResumeNext instance.
storage.registerSlowObjectFactory(31 /* SlowAsyncFunctionActivationResumeNext */, function ($slow) {
    var resumeNext = new SlowAsyncFunctionActivationResumeNext(null);
    resumeNext.$slow = $slow;
    return resumeNext;
});
module.exports = SlowAsyncFunctionActivationResumeNext;
//# sourceMappingURL=slowAsyncFunctionActivationResumeNext.js.map