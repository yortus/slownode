// TODO: properly handle (at runtime) use before assignment for block-scoped vars, prevent re-assignment of consts, etc
// TODO: add ERR register to VM for exception in flight? (can only be one)
import Register from './register';





// TODO: for brevity below...
export type R = Register;





// TODO: ...
export default class VirtualMachine {

    // Instructions: Load/store
    LOAD    (tgt: R, obj: R, key: R) { tgt.value = obj.value[key.value]; }
    STORE   (obj: R, key: R, src: R) { obj.value[key.value] = src.value; }

    // Instructions: Arithmetic/logic
    ADD     (tgt: R, lhs: R, rhs: R) { tgt.value = lhs.value + rhs.value; }
    SUB     (tgt: R, lhs: R, rhs: R) { tgt.value = lhs.value - rhs.value; }
    MUL     (tgt: R, lhs: R, rhs: R) { tgt.value = lhs.value * rhs.value; }
    DIV     (tgt: R, lhs: R, rhs: R) { tgt.value = lhs.value / rhs.value; }
    NEG     (tgt: R, arg: R) { tgt.value = -arg.value; }
    NOT     (tgt: R, arg: R) { tgt.value = !arg.value; }

    // Instructions: Relational
    EQ      (tgt: R, lhs: R, rhs: R) { tgt.value = lhs.value === rhs.value; }
    GE      (tgt: R, lhs: R, rhs: R) { tgt.value = lhs.value >= rhs.value; }
    GT      (tgt: R, lhs: R, rhs: R) { tgt.value = lhs.value > rhs.value; }
    LE      (tgt: R, lhs: R, rhs: R) { tgt.value = lhs.value <= rhs.value; }
    LT      (tgt: R, lhs: R, rhs: R) { tgt.value = lhs.value < rhs.value; }
    NE      (tgt: R, lhs: R, rhs: R) { tgt.value = lhs.value !== rhs.value; }

    // Instructions: Control
    B       (line: number) { this.PC.value = line; }
    BF      (line: number, arg: R) { arg.value ? null : this.PC.value = line; }
    BT      (line: number, arg: R) { arg.value ? this.PC.value = line : null; }
    CALL    (tgt: R, func: R, thís: R, args: R) { tgt.value = func.value.apply(thís.value, args.value); }
    THROW   = async (err: R) => { throw err.value; } // TODO: temporary soln... how to really implement this?
    AWAIT   = async (tgt: R, arg: R) => { tgt.value = await arg.value; }
    STOP    () { this.PC.value = Infinity; }

    // Instructions: Data
    STRING  (tgt: R, val: string) { tgt.value = val; }
    NUMBER  (tgt: R, val: number) { tgt.value = val; }
    REGEXP  (tgt: R, pattern: string, flags: string) { tgt.value = new RegExp(pattern, flags); }
    ARRAY   (tgt: R) { tgt.value = []; }
    OBJECT  (tgt: R) { tgt.value = {}; }
    TRUE    (tgt: R) { tgt.value = true; }
    FALSE   (tgt: R) { tgt.value = false; }
    NULL    (tgt: R) { tgt.value = null; }
    UNDEFD  (tgt: R) { tgt.value = void 0; }

    // Registers
    PC      = <R> {name: 'PC', value: 0}
    ENV     = <R> {name: 'ENV', value: void 0}
    $0      = <R> {name: '$0', value: void 0}
    $1      = <R> {name: '$1', value: void 0}
    $2      = <R> {name: '$2', value: void 0}
    $3      = <R> {name: '$3', value: void 0}
    $4      = <R> {name: '$4', value: void 0}
    $5      = <R> {name: '$5', value: void 0}
    $6      = <R> {name: '$6', value: void 0}
    $7      = <R> {name: '$7', value: void 0}
}
