'use strict';
import Register from './register';
export default InstructionSet;





// TODO: ...
interface InstructionSet {

    // Load/store
    LOAD:   (tgt: Register, obj: Register, key: Register) => void;
    STORE:  (obj: Register, key: Register, src: Register) => void;

    // Arithmetic/logic
    ADD:    (tgt: Register, lhs: Register, rhs: Register) => void;
    SUB:    (tgt: Register, lhs: Register, rhs: Register) => void;
    MUL:    (tgt: Register, lhs: Register, rhs: Register) => void;
    DIV:    (tgt: Register, lhs: Register, rhs: Register) => void;
    NEG:    (tgt: Register, arg: Register) => void;
    NOT:    (tgt: Register, arg: Register) => void;

    // Comparison
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
    THROW:  (err: Register) => Promise<void>;
    AWAIT:  (tgt: Register, arg: Register) => Promise<void>;
    STOP:   () => void;

    // Data
    STRING: (tgt: Register, val: string) => void;
    NUMBER: (tgt: Register, val: number) => void;
    REGEXP: (tgt: Register, pattern: string, flags: string) => void;
    ARRAY:  (tgt: Register) => void;
    OBJECT: (tgt: Register) => void;
    TRUE:   (tgt: Register) => void;
    FALSE:  (tgt: Register) => void;
    NULL:   (tgt: Register) => void;

    // Meta
    PARK:   (...regs: Register[]) => void;
}
