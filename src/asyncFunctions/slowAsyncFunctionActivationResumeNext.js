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
module.exports = SlowAsyncFunctionActivationResumeNext;
//// TODO: register slow object type with storage (for rehydration logic)
//storage.registerType({
//    type: SlowType.SlowAsyncFunctionContinuationWithResult,
//    dehydrate: (p: any, recurse: (obj) => any) => {
//        if (!p || !p.$slow || p.$slow.type !== SlowType.SlowAsyncFunctionContinuationWithResult) return;
//        var jsonSafeObject = _.mapValues(p.$slow, propValue => recurse(propValue));
//        return jsonSafeObject;
//    },
//    rehydrate: jsonSafeObject => makeContinuationResultHandler(jsonSafeObject.safa)
//});
//# sourceMappingURL=slowAsyncFunctionActivationResumeNext.js.map