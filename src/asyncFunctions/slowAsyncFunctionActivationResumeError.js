var makeCallableClass = require('../util/makeCallableClass');
var runToCompletion = require('./runToCompletion');
var storage = require('../storage/storage');
/**
 * Creates a callable slow object that throws the given error into
 * the given slow async function actvation.
 */
var SlowAsyncFunctionActivationResumeError = makeCallableClass({
    constructor: function (safa) {
        this._slow = { type: 32 /* SlowAsyncFunctionActivationResumeError */, safa: safa };
        storage.created(this);
    },
    call: function (error) {
        runToCompletion(this._slow.safa, error);
    },
    bindThis: true
});
module.exports = SlowAsyncFunctionActivationResumeError;
//# sourceMappingURL=slowAsyncFunctionActivationResumeError.js.map