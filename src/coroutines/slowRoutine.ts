import types = require('types');
export = SlowRoutine;


// TODO: doc...
class SlowRoutine implements types.SlowRoutine {

    // TODO: doc...
    constructor(private stateMachine: types.SlowRoutine.StateMachine, public state: types.SlowRoutine.StateMachine.State) { }

    // TODO: doc...
    next = makeResumeMethod('yield', this.stateMachine, this.state);

    // TODO: doc...
    throw = makeResumeMethod('throw', this.stateMachine, this.state);

    // TODO: doc...
    return = makeResumeMethod('return', this.stateMachine, this.state);
}


/** Helper function for creating SlowRoutine's `next`, `throw`, and `return` method bodies. */
function makeResumeMethod(type: string, stateMachine: types.SlowRoutine.StateMachine, state: types.SlowRoutine.StateMachine.State) {
    return (value?: any) => {
        state.incoming = { type, value };
        stateMachine(state);
        var outgoing = state.outgoing;
        delete state.incoming;
        delete state.outgoing;
        if (outgoing.type === 'throw') throw outgoing.value;
        return { done: outgoing.type === 'return', value: outgoing.value };
    };
}
