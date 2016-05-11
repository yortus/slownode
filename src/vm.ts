'use strict';
import {Register} from './registers';





export interface VM {

    // Load/store
    LOAD:   (tgt: Register, obj: Register, key: Register|string|number) => void;
    LOADC:  (tgt: Register, val: string|number|boolean|null) => void;
    STORE:  (src: Register, obj: Register, key: Register|string|number) => void;

    // Arithmetic/logic
    ADD:    (tgt: Register, lhs: Register, rhs: Register) => void;
    SUB:    (tgt: Register, lhs: Register, rhs: Register) => void;
    MUL:    (tgt: Register, lhs: Register, rhs: Register) => void;
    DIV:    (tgt: Register, lhs: Register, rhs: Register) => void;
    NEG:    (tgt: Register, arg: Register) => void;
    NOT:    (tgt: Register, arg: Register) => void;

    // Compare
    EQ:     (tgt: Register, lhs: Register, rhs: Register) => void;
    GE:     (tgt: Register, lhs: Register, rhs: Register) => void;
    GT:     (tgt: Register, lhs: Register, rhs: Register) => void;
    LE:     (tgt: Register, lhs: Register, rhs: Register) => void;
    LT:     (tgt: Register, lhs: Register, rhs: Register) => void;
    NE:     (tgt: Register, lhs: Register, rhs: Register) => void;

    // Control
    B:      (line: number) => void;
    BF:     (line: number, arg: Register) => void;
    BT:     (line: number, arg: Register) => void;

    // Registers
    PC:     number;
    ENV:    Register;
    $0:     Register;
    $1:     Register;
    $2:     Register;
    $3:     Register;
    $4:     Register;
    $5:     Register;
    $6:     Register;
    $7:     Register;
}





export function makeVM() {

    let vm: VM = {
        LOAD:   (tgt, obj, key) => tgt.value = obj.value[key instanceof Register ? key.value : key],
        LOADC:  (tgt, val) => tgt.value = val,
        STORE:  (src, obj, key) => obj.value[key instanceof Register ? key.value : key] = src.value,

        ADD:    (tgt, lhs, rhs) => tgt.value = lhs.value + rhs.value,
        SUB:    (tgt, lhs, rhs) => tgt.value = lhs.value - rhs.value,
        MUL:    (tgt, lhs, rhs) => tgt.value = lhs.value * rhs.value,
        DIV:    (tgt, lhs, rhs) => tgt.value = lhs.value / rhs.value,
        NEG:    (tgt, arg) => tgt.value = -arg.value,
        NOT:    (tgt, arg) => tgt.value = !arg.value,

        EQ:     (tgt, lhs, rhs) => tgt.value = lhs.value === rhs.value,
        GE:     (tgt, lhs, rhs) => tgt.value = lhs.value >= rhs.value,
        GT:     (tgt, lhs, rhs) => tgt.value = lhs.value > rhs.value,
        LE:     (tgt, lhs, rhs) => tgt.value = lhs.value <= rhs.value,
        LT:     (tgt, lhs, rhs) => tgt.value = lhs.value < rhs.value,
        NE:     (tgt, lhs, rhs) => tgt.value = lhs.value !== rhs.value,

        B:      (line) => jump(line),
        BF:     (line, arg) => arg.value ? null : jump(line),
        BT:     (line, arg) => arg.value ? jump(line) : null,

        PC:     0,
        ENV:    new Register('ENV'),
        $0:     new Register('$0'),
        $1:     new Register('$1'),
        $2:     new Register('$2'),
        $3:     new Register('$3'),
        $4:     new Register('$4'),
        $5:     new Register('$5'),
        $6:     new Register('$6'),
        $7:     new Register('$7')
    };

    function jump(line: number) {
        // TODO: scope enter/exit, finally blacks
        vm.PC = line;
    }

    vm.ENV.value = {};
    return vm;
}
