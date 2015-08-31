import types = require('types');
export = Steppable;


// TODO: doc...
class Steppable implements types.Steppable {

    // TODO: doc...
    constructor(public stateMachine: types.Steppable.StateMachine) { }

    // TODO: doc...
    next = makeResumeMethod('yield', this);

    // TODO: doc...
    throw = makeResumeMethod('throw', this);

    // TODO: doc...
    return = makeResumeMethod('return', this);

    // TODO: doc...
    state: types.Steppable.StateMachine.State
}


/** Helper function for creating Steppable's `next`, `throw`, and `return` method bodies. */
function makeResumeMethod(type: string, steppable: Steppable) {
    return (value?: any) => {
        steppable.state.incoming = { type, value };
        steppable.stateMachine(steppable.state);
        var outgoing = steppable.state.outgoing;
        delete steppable.state.incoming;
        delete steppable.state.outgoing;
        if (outgoing.type === 'throw') throw outgoing.value;
        return { done: outgoing.type === 'return', value: outgoing.value };
    };
}
