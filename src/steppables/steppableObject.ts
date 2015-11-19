//import SteppableStateMachine = require('./steppableStateMachine');
//export = SteppableObject;


///**
// * Defines the Steppable object returned by a call to SteppableFunction#[[call]].
// * A Steppable object is analogous to an ES6 generator object.
// */
//class SteppableObject {

//    /** Creates a new SteppableObject instance. */
//    constructor(public stateMachine: SteppableStateMachine) { }

//    /** Resumes the steppable object with the given value. */
//    next = makeResumeMethod('yield', this);

//    /** Resumes the steppable object, throwing the given value at the current point of execution. */
//    throw = makeResumeMethod('throw', this);

//    /** Resumes the steppable object, returning the given value at the current point of execution. */
//    return = makeResumeMethod('return', this);

//    /** State of all locals at the current point of execution. */
//    state: SteppableStateMachine.State
//}


///** Helper function for creating Steppable's `next`, `throw`, and `return` method bodies. */
//function makeResumeMethod(type: string, steppable: SteppableObject) {
//    return (value?: any) => {
//        steppable.state.incoming = { type, value };
//        steppable.stateMachine(steppable.state);
//        var outgoing = steppable.state.outgoing;
//        delete steppable.state.incoming;
//        delete steppable.state.outgoing;
//        if (outgoing.type === 'throw') throw outgoing.value;
//        return { done: outgoing.type === 'return', value: outgoing.value };
//    };
//}
