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
module.exports = SlowAsyncFunctionActivationResumeError;
//// TODO: register slow object type with storage (for rehydration logic)
//storage.registerType({
//    type: SlowType.SlowAsyncFunctionContinuationWithError,
//    dehydrate: (p: any, recurse: (obj) => any) => {
//        if (!p || !p.$slow || p.$slow.type !== SlowType.SlowAsyncFunctionContinuationWithError) return;
//        var jsonSafeObject = _.mapValues(p.$slow, propValue => recurse(propValue));
//        return jsonSafeObject;
//    },
//    rehydrate: jsonSafeObject => makeContinuationErrorHandler(jsonSafeObject.safa)
//});
//# sourceMappingURL=slowAsyncFunctionActivationResumeError.js.map