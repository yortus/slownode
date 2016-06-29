import VirtualMachine, {InstructionSet, Register, RegisterSet} from '../virtual-machine';





// TODO: ... `park` callback has got to go...
export default function makeVirtualMachine(): VirtualMachine {
    let virtualMachine: VirtualMachine = <any> {};
    makeRegisters(virtualMachine);
    makeInstructions(virtualMachine, virtualMachine.PC);
    return virtualMachine;
}




// TODO: ...
function makeInstructions(target: InstructionSet, pc: Register) {
    let instructions: InstructionSet = {

// TODO: convert all to method shorthand - too risky with return value otherwise, in case a Promise shows up (eg in CALL)...

        // Load/store
        // TODO: properly handle use before assignment for block-scoped vars, prevent re-assignment of consts, etc
        LOAD:   (tgt, obj, key) => { tgt.value = obj.value[key.value]; },
        STORE:  (obj, key, src) => { obj.value[key.value] = src.value; },

        // Arithmetic/logic
        ADD:    (tgt, lhs, rhs) => { tgt.value = lhs.value + rhs.value; },
        SUB:    (tgt, lhs, rhs) => { tgt.value = lhs.value - rhs.value; },
        MUL:    (tgt, lhs, rhs) => { tgt.value = lhs.value * rhs.value; },
        DIV:    (tgt, lhs, rhs) => { tgt.value = lhs.value / rhs.value; },
        NEG:    (tgt, arg) => { tgt.value = -arg.value; },
        NOT:    (tgt, arg) => { tgt.value = !arg.value; },

        // Relational
        EQ:     (tgt, lhs, rhs) => { tgt.value = lhs.value === rhs.value; },
        GE:     (tgt, lhs, rhs) => { tgt.value = lhs.value >= rhs.value; },
        GT:     (tgt, lhs, rhs) => { tgt.value = lhs.value > rhs.value; },
        LE:     (tgt, lhs, rhs) => { tgt.value = lhs.value <= rhs.value; },
        LT:     (tgt, lhs, rhs) => { tgt.value = lhs.value < rhs.value; },
        NE:     (tgt, lhs, rhs) => { tgt.value = lhs.value !== rhs.value; },

        // Control
        B:      (line: number) => { pc.value = line; },
        BF:     (line: number, arg) => { arg.value ? null : pc.value = line; },
        BT:     (line: number, arg) => { arg.value ? pc.value = line : null; },
        CALL:   (tgt, func, thís, args) => { tgt.value = func.value.apply(thís.value, args.value); },
        THROW:  (err) => Promise.reject(err.value), // TODO: temporary soln... how to really implement this?
        AWAIT:  async (tgt, arg) => tgt.value = await arg.value,
        STOP:   () => { pc.value = Infinity; },

        // Data
        STRING: (tgt, val) => { tgt.value = val; },
        NUMBER: (tgt, val) => { tgt.value = val; },
        REGEXP: (tgt, pattern, flags) => { tgt.value = new RegExp(pattern, flags); },
        ARRAY:  (tgt) => { tgt.value = []; },
        OBJECT: (tgt) => { tgt.value = {}; },
        TRUE:   (tgt) => { tgt.value = true; },
        FALSE:  (tgt) => { tgt.value = false; },
        NULL:   (tgt) => { tgt.value = null; },
        UNDEFD:   (tgt) => { tgt.value = void 0; }
    };

    // TODO: copy to target...
    Object.keys(instructions).forEach(key => {
        target[key] = instructions[key];
    });
}





// TODO: ...
function makeRegisters(target: RegisterSet) {

    let registers: RegisterSet = {
        // TODO: add ERR register for exception in flight? (can only be one)
        PC:     {name: 'PC', value: 0},
        ENV:    {name: 'ENV', value: void 0},
        $0:     {name: '$0', value: void 0},
        $1:     {name: '$1', value: void 0},
        $2:     {name: '$2', value: void 0},
        $3:     {name: '$3', value: void 0},
        $4:     {name: '$4', value: void 0},
        $5:     {name: '$5', value: void 0},
        $6:     {name: '$6', value: void 0},
        $7:     {name: '$7', value: void 0}
    };

    // TODO: copy to target...
    Object.keys(registers).forEach(key => {
        target[key] = registers[key];
    });
}
