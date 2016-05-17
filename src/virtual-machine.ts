'use strict';
export default VirtualMachine;





// TODO: ...
interface VirtualMachine {

    // Load/store/move
    LOAD:   (tgt: Register, obj: Register, key: Register|string|number) => void;
    LOADC:  (tgt: Register, val: string|number|boolean|null) => void;
    STORE:  (obj: Register, key: Register|string|number, src: Register) => void;
    MOVE:   (tgt: Register, src: Register) => void;

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
    CALL:   (tgt: Register, func: Register, thís: Register, args: Register) => void;

    // Misc
    NEWARR: (tgt: Register) => void; // TODO: really primitive? could use ctor
    NEWOBJ: (tgt: Register) => void; // TODO: really primitive? could use ctor
    NOOP:   () => void;

    // Registers
    PC:     Register;
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





// TODO: ...
export class Register {


    // TODO: ...
    constructor(name?: string, value?: any) {
        this.name = name || 'Unnamed Register';
        this.value = value;
    }


    // TODO: ...
    name: string;


    // TODO: ...
    value: any;
}
