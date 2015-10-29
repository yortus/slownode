/**
 * Defines the Steppable object returned by a call to SteppableFunction#[[call]].
 * A Steppable object is analogous to an ES6 generator object.
 */
var SteppableObject = (function () {
    /** Creates a new SteppableObject instance. */
    function SteppableObject(stateMachine) {
        this.stateMachine = stateMachine;
        /** Resumes the steppable object with the given value. */
        this.next = makeResumeMethod('yield', this);
        /** Resumes the steppable object, throwing the given value at the current point of execution. */
        this.throw = makeResumeMethod('throw', this);
        /** Resumes the steppable object, returning the given value at the current point of execution. */
        this.return = makeResumeMethod('return', this);
    }
    return SteppableObject;
})();
/** Helper function for creating Steppable's `next`, `throw`, and `return` method bodies. */
function makeResumeMethod(type, steppable) {
    return function (value) {
        steppable.state.incoming = { type: type, value: value };
        steppable.stateMachine(steppable.state);
        var outgoing = steppable.state.outgoing;
        delete steppable.state.incoming;
        delete steppable.state.outgoing;
        if (outgoing.type === 'throw')
            throw outgoing.value;
        return { done: outgoing.type === 'return', value: outgoing.value };
    };
}
module.exports = SteppableObject;
//# sourceMappingURL=steppableObject.js.map