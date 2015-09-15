var makeCallableClass = require('../util/makeCallableClass');
var runToCompletion = require('./runToCompletion');
var storage = require('../storage/storage');
/**
 * Creates a callable slow object that resumes the given slow async
 * function activation with the given value.
 */
var SlowAsyncFunctionActivationResumeNext = makeCallableClass({
    constructor: function (safa) {
        this._slow = { type: 31 /* SlowAsyncFunctionActivationResumeNext */, safa: safa };
        storage.created(this);
    },
    call: function (value) {
        runToCompletion(this._slow.safa, null, value);
    },
    bindThis: true
});
module.exports = SlowAsyncFunctionActivationResumeNext;
//# sourceMappingURL=slowAsyncFunctionActivationResumeNext.js.map