import types = require('types');
export = SteppableObject;


/**
 * Defines the Steppable object returned by a call to SteppableFunction#[[call]].
 * A Steppable object is analogous to an ES6 generator object.
 */
class SteppableObject {
    constructor(public stateMachine: types.Steppable.StateMachine) { }
    next = makeResumeMethod('yield', this);
    throw = makeResumeMethod('throw', this);
    return = makeResumeMethod('return', this);
    state: types.Steppable.StateMachine.State
}


/** Helper function for creating Steppable's `next`, `throw`, and `return` method bodies. */
function makeResumeMethod(type: string, steppable: SteppableObject) {
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
