var makeCallableClass = require('../util/makeCallableClass');
var runToCompletion = require('./runToCompletion');
var storage = require('../storage/storage');
/**
 * Creates a callable slow object that throws the given error into
 * the given slow async function actvation.
 */
var SlowAsyncFunctionActivationResumeError = makeCallableClass({
    constructor: function (safa) {
        this.$slow = { type: 32 /* SlowAsyncFunctionActivationResumeError */, safa: safa };
        storage.created(this);
    },
    call: function (error) {
        runToCompletion(this.$slow.safa, error);
    },
    bindThis: true
});
// Tell storage how to create a SlowAsyncFunctionActivationResumeError instance.
storage.registerSlowObjectFactory(32 /* SlowAsyncFunctionActivationResumeError */, function ($slow) {
    var resumeError = new SlowAsyncFunctionActivationResumeError(null);
    resumeError.$slow = $slow;
    return resumeError;
});
module.exports = SlowAsyncFunctionActivationResumeError;
//# sourceMappingURL=slowAsyncFunctionActivationResumeError.js.map