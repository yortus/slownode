var _ = require('lodash');
/**
 * This is a transliteration of the [[Resolve]](promise, x) pseudocode in the Promises A+ Spec.
 * See: https://github.com/promises-aplus/promises-spec
 */
function standardResolutionProcedure(p, x) {
    if (x === p) {
        p.reject(new TypeError("slownode: cannot resolve promise with itself"));
    }
    else if (_.isObject(x) || _.isFunction(x)) {
        try {
            var then = x.then;
        }
        catch (ex) {
            p.reject(ex);
            return;
        }
        if (_.isFunction(then)) {
            var ignoreFurtherCalls = false;
            try {
                then.apply(x, [
                    function resolvePromise(y) {
                        if (ignoreFurtherCalls)
                            return;
                        ignoreFurtherCalls = true;
                        standardResolutionProcedure(p, y);
                    },
                    function rejectPromise(r) {
                        if (ignoreFurtherCalls)
                            return;
                        ignoreFurtherCalls = true;
                        p.reject(r);
                    },
                ]);
            }
            catch (ex) {
                if (ignoreFurtherCalls)
                    return;
                p.reject(ex);
            }
        }
        else {
            p.fulfil(x);
        }
    }
    else {
        p.fulfil(x);
    }
}
module.exports = standardResolutionProcedure;
//# sourceMappingURL=standardResolutionProcedure.js.map