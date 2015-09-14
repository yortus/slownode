/** Defines the Steppable object returned by a call to SteppableFunction#[[call]]. */
var SteppableObject = (function () {
    function SteppableObject(stateMachine) {
        this.stateMachine = stateMachine;
        this.next = makeResumeMethod('yield', this);
        this.throw = makeResumeMethod('throw', this);
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