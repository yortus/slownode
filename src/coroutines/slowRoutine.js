// TODO: doc...
var SlowRoutine = (function () {
    // TODO: doc...
    function SlowRoutine(stateMachine, state) {
        this.stateMachine = stateMachine;
        this.state = state;
        // TODO: doc...
        this.next = makeResumeMethod('yield', this.stateMachine, this.state);
        // TODO: doc...
        this.throw = makeResumeMethod('throw', this.stateMachine, this.state);
        // TODO: doc...
        this.return = makeResumeMethod('return', this.stateMachine, this.state);
    }
    return SlowRoutine;
})();
/** Helper function for creating SlowRoutine's `next`, `throw`, and `return` method bodies. */
function makeResumeMethod(type, stateMachine, state) {
    return function (value) {
        state.incoming = { type: type, value: value };
        stateMachine(state);
        var outgoing = state.outgoing;
        delete state.incoming;
        delete state.outgoing;
        if (outgoing.type === 'throw')
            throw outgoing.value;
        return { done: outgoing.type === 'return', value: outgoing.value };
    };
}
module.exports = SlowRoutine;
//# sourceMappingURL=slowRoutine.js.map