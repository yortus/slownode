var SlowPromise = (function (resolver) {
    var result = {};
    // TODO: temp testing...
    return result;
});
SlowPromise.defer = function (spid) {
    var promise = {
        then: null,
        catch: null,
        _spid: null,
        _state: null,
        _value: null
    };
    var resolve;
    var reject;
    return { promise: promise, resolve: resolve, reject: reject };
};
/** Helper function for creating SlowPromise's `then` method body. */
function makeThenMethod() {
    return function (x) {
        return null;
    };
}
module.exports = SlowPromise;
//# sourceMappingURL=slowPromise.js.map