// TODO: add top-level getters/setters for PC, ENV? all regs?
// TODO: rename ENV --> $ENV, PC --> $PC, ERR --> $ERR
// TODO: properly handle (at runtime) use before assignment for block-scoped vars, prevent re-assignment of consts, etc
// TODO: add ERR register to VM for exception in flight? (can only be one)
// TODO: add CONST opcode to replace STRING, NUMBER, NULL, TRUE, FALSE





// TODO: ...
type R = 'PC' | 'ENV' | 'ERR' | '$0' | '$1' | '$2' | '$3' | '$4' | '$5' | '$6' | '$7';
export {R as Register};





// TODO: ...
export default class JasmProcessor {

    // Instructions: Load/store
    LOAD    (tgt: R, obj: R, key: R) { let r = this.registers; r.set(tgt, r.get(obj)[r.get(key)]); }
    STORE   (obj: R, key: R, src: R) { let r = this.registers; r.get(obj)[r.get(key)] = r.get(src); }

    // Instructions: Arithmetic/logic
    ADD     (tgt: R, lhs: R, rhs: R) { let r = this.registers; r.set(tgt, r.get(lhs) + r.get(rhs)); }
    SUB     (tgt: R, lhs: R, rhs: R) { let r = this.registers; r.set(tgt, r.get(lhs) - r.get(rhs)); }
    MUL     (tgt: R, lhs: R, rhs: R) { let r = this.registers; r.set(tgt, r.get(lhs) * r.get(rhs)); }
    DIV     (tgt: R, lhs: R, rhs: R) { let r = this.registers; r.set(tgt, r.get(lhs) / r.get(rhs)); }
    NEG     (tgt: R, arg: R) { let r = this.registers; r.set(tgt, -r.get(arg)); }
    NOT     (tgt: R, arg: R) { let r = this.registers; r.set(tgt, !r.get(arg)); }

    // Instructions: Relational
    EQ      (tgt: R, lhs: R, rhs: R) { let r = this.registers; r.set(tgt, r.get(lhs) === r.get(rhs)); }
    GE      (tgt: R, lhs: R, rhs: R) { let r = this.registers; r.set(tgt, r.get(lhs) >=  r.get(rhs)); }
    GT      (tgt: R, lhs: R, rhs: R) { let r = this.registers; r.set(tgt, r.get(lhs) >   r.get(rhs)); }
    LE      (tgt: R, lhs: R, rhs: R) { let r = this.registers; r.set(tgt, r.get(lhs) <=  r.get(rhs)); }
    LT      (tgt: R, lhs: R, rhs: R) { let r = this.registers; r.set(tgt, r.get(lhs) <   r.get(rhs)); }
    NE      (tgt: R, lhs: R, rhs: R) { let r = this.registers; r.set(tgt, r.get(lhs) !== r.get(rhs)); }

    // Instructions: Control
    B       (line: number) { this.PC = line; }
    BF      (line: number, arg: R) { this.registers.get(arg) ? null : this.PC = line; }
    BT      (line: number, arg: R) { this.registers.get(arg) ? this.registers.set('PC', line) : null; }
    CALL    (tgt: R, func: R, thís: R, args: R) { let r = this.registers; r.set(tgt, r.get(func).apply(r.get(thís), r.get(args))); }
    THROW   = async (err: R) => { throw this.registers[err]; } // TODO: temporary soln... how to really implement this?
    AWAIT   = async (tgt: R, arg: R) => { let r = this.registers; r.set(tgt, await r.get(arg)); }
    STOP    () { this.PC = Infinity; }

    // Instructions: Data
    STRING  (tgt: R, val: string) { this.registers.set(tgt, val); }
    NUMBER  (tgt: R, val: number) { this.registers.set(tgt, val); }
    REGEXP  (tgt: R, pattern: string, flags: string) { this.registers.set(tgt, new RegExp(pattern, flags)); }
    ARRAY   (tgt: R) { this.registers.set(tgt, []); }
    OBJECT  (tgt: R) { this.registers.set(tgt, {}); }
    TRUE    (tgt: R) { this.registers.set(tgt, true); }
    FALSE   (tgt: R) { this.registers.set(tgt, false); }
    NULL    (tgt: R) { this.registers.set(tgt, null); }
    UNDEFD  (tgt: R) { this.registers.set(tgt, void 0); }

    // Registers
    registers = new Map(<[R, any][]>[
        ['PC', 0],
        ['ENV', void 0],
        ['ERR', void 0],
        ['$0', void 0],
        ['$1', void 0],
        ['$2', void 0],
        ['$3', void 0],
        ['$4', void 0],
        ['$5', void 0],
        ['$6', void 0],
        ['$7', void 0]
    ]);
    get PC() { return <number> this.registers.get('PC'); }
    set PC(value: number) { this.registers.set('PC', value); }
}
