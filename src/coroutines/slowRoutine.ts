import types = require('types');
export = SlowRoutine;


/** Creates a SlowRoutine instance. May be called with or without 'new'. */
function SlowRoutine(bodyFunc: (state) => void, state: any) {

    var result: types.SlowRoutine = {
        next: makeResumeMethod('yield', bodyFunc, state),
        throw: makeResumeMethod('throw', bodyFunc, state),
        return: makeResumeMethod('return', bodyFunc, state),
        state: state
    };
    return result;
}


/** Helper function for creating SlowRoutine's `next`, `throw`, and `return` method bodies. */
function makeResumeMethod(type: string, body: Function, state: any) {
    return (value?: any) => {
        state.incoming = { type, value };
        body(state);
        var outgoing = state.outgoing;
        delete state.incoming;
        delete state.outgoing;
        if (outgoing.type === 'throw') throw outgoing.value;
        return { done: outgoing.type === 'return', value: outgoing.value };
    };
}
