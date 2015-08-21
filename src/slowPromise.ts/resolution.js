var async = require("asyncawait/async");
var await = require("asyncawait/await");
var db = require("../knexConnection");
function resolve(slowPromise) {
    var resolveFn = async(function (value) {
        await(db("SlowPromise")
            .update("value", value)
            .where("id", "=", slowPromise._id));
    });
    //TODO: Call then handler(s)
    return resolveFn;
}
exports.resolve = resolve;
function reject(slowPromise) {
    var resolveFn = async(function (reason) {
        await(db("SlowPromise")
            .update("reject", reason)
            .where("id", "=", slowPromise._id));
    });
    //TODO: Call catch handler
    return resolveFn;
}
exports.reject = reject;
//# sourceMappingURL=resolution.js.map