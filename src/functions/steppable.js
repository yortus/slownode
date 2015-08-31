// TODO: doc...
var Steppable = (function () {
    // TODO: doc...
    function Steppable(stateMachine) {
        this.stateMachine = stateMachine;
        // TODO: doc...
        this.next = makeResumeMethod('yield', this);
        // TODO: doc...
        this.throw = makeResumeMethod('throw', this);
        // TODO: doc...
        this.return = makeResumeMethod('return', this);
    }
    return Steppable;
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
module.exports = Steppable;
//# sourceMappingURL=steppable.js.map