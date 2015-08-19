/** Creates a SlowRoutine instance. May be called with or without 'new'. */
function SlowRoutine(bodyFunc, state) {
    var result = {
        next: makeResumeMethod('yield', bodyFunc, state),
        throw: makeResumeMethod('throw', bodyFunc, state),
        return: makeResumeMethod('return', bodyFunc, state),
        _body: bodyFunc,
        _state: state
    };
    return result;
}
/** Helper function for creating SlowRoutine's `next`, `throw`, and `return` method bodies. */
function makeResumeMethod(type, body, state) {
    return function (value) {
        state.incoming = { type: type, value: value };
        body(state);
        if (state.outgoing.type === 'throw') {
            throw state.outgoing.value;
        }
        return {
            done: state.outgoing.type === 'return',
            value: state.outgoing.value
        };
    };
}
module.exports = SlowRoutine;
//# sourceMappingURL=slowRoutine.js.map