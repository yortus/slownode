// TODO: doc...
var SlowRoutine = (function () {
    // TODO: doc...
    function SlowRoutine(stateMachine) {
        this.stateMachine = stateMachine;
        // TODO: doc...
        this.next = makeResumeMethod('yield', this);
        // TODO: doc...
        this.throw = makeResumeMethod('throw', this);
        // TODO: doc...
        this.return = makeResumeMethod('return', this);
    }
    return SlowRoutine;
})();
/** Helper function for creating SlowRoutine's `next`, `throw`, and `return` method bodies. */
function makeResumeMethod(type, sloro) {
    return function (value) {
        sloro.state.incoming = { type: type, value: value };
        sloro.stateMachine(sloro.state);
        var outgoing = sloro.state.outgoing;
        delete sloro.state.incoming;
        delete sloro.state.outgoing;
        if (outgoing.type === 'throw')
            throw outgoing.value;
        return { done: outgoing.type === 'return', value: outgoing.value };
    };
}
module.exports = SlowRoutine;
//# sourceMappingURL=slowRoutine.js.map