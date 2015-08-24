/** Creates a SlowPromise instance. May be called with or without 'new'. */
function SlowPromise(idOrResolver) {
    if (arguments.length === 0) {
    }
    else if (typeof idOrResolver === 'number') {
    }
    else if (typeof idOrResolver === 'function') {
    }
    else {
    }
    // TODO: ...
    //var result: Types.SlowPromise = {
    //    then: makeThenMethod(),
    //    _spid: spid,
    //    _state: state,
    //    _value: value
    //};
    //return result;
}
/** Helper function for creating SlowPromise's `then` method body. */
function makeThenMethod() {
    return function (x) {
        return null;
    };
}
module.exports = SlowPromise;
//# sourceMappingURL=slowPromise.js.map