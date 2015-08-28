import types = require('types');
export = SlowRoutine;


// TODO: doc...
class SlowRoutine implements types.SlowRoutine {

    // TODO: doc...
    constructor(public stateMachine: types.SlowRoutine.StateMachine) { }

    // TODO: doc...
    next = makeResumeMethod('yield', this);

    // TODO: doc...
    throw = makeResumeMethod('throw', this);

    // TODO: doc...
    return = makeResumeMethod('return', this);

    // TODO: doc...
    state: types.SlowRoutine.StateMachine.State
}


/** Helper function for creating SlowRoutine's `next`, `throw`, and `return` method bodies. */
function makeResumeMethod(type: string, sloro: SlowRoutine) {
    return (value?: any) => {
        sloro.state.incoming = { type, value };
        sloro.stateMachine(sloro.state);
        var outgoing = sloro.state.outgoing;
        delete sloro.state.incoming;
        delete sloro.state.outgoing;
        if (outgoing.type === 'throw') throw outgoing.value;
        return { done: outgoing.type === 'return', value: outgoing.value };
    };
}
