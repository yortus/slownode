// TODO: add top-level getters/setters for PC, ENV? all regs?
// TODO: rename ENV --> $ENV, PC --> $PC, ERR --> $ERR
// TODO: properly handle (at runtime) use before assignment for block-scoped vars, prevent re-assignment of consts, etc
// TODO: add ERR register to VM for exception in flight? (can only be one)
// TODO: add CONST opcode to replace STRING, NUMBER, NULL, TRUE, FALSE
import {RegisterName} from './jasm';





// TODO: ...
type R = RegisterName;
export {R as RegisterName};





// TODO: ...
export default class JasmProcessor {

    // Instructions: Load/store
    LOAD        (tgt: R, obj: R, key: R) { this[tgt] = this[obj][this[key]]; }
    STORE       (obj: R, key: R, src: R) { this[obj][this[key]] = this[src]; }

    // Instructions: Arithmetic/logic
    ADD         (tgt: R, lhs: R, rhs: R) { this[tgt] = this[lhs] + this[rhs]; }
    SUB         (tgt: R, lhs: R, rhs: R) { this[tgt] = this[lhs] - this[rhs]; }
    MUL         (tgt: R, lhs: R, rhs: R) { this[tgt] = this[lhs] * this[rhs]; }
    DIV         (tgt: R, lhs: R, rhs: R) { this[tgt] = this[lhs] / this[rhs]; }
    NEG         (tgt: R, arg: R) { this[tgt] = -this[arg]; }
    NOT         (tgt: R, arg: R) { this[tgt] = !this[arg]; }

    // Instructions: Relational
    EQ          (tgt: R, lhs: R, rhs: R) { this[tgt] = this[lhs] === this[rhs]; }
    GE          (tgt: R, lhs: R, rhs: R) { this[tgt] = this[lhs] >=  this[rhs]; }
    GT          (tgt: R, lhs: R, rhs: R) { this[tgt] = this[lhs] >   this[rhs]; }
    LE          (tgt: R, lhs: R, rhs: R) { this[tgt] = this[lhs] <=  this[rhs]; }
    LT          (tgt: R, lhs: R, rhs: R) { this[tgt] = this[lhs] <   this[rhs]; }
    NE          (tgt: R, lhs: R, rhs: R) { this[tgt] = this[lhs] !== this[rhs]; }

    // Instructions: Control
    B           (line: number) { this.PC = line; }
    BF          (line: number, arg: R) { this[arg] ? null : this.PC = line; }
    BT          (line: number, arg: R) { this[arg] ? this.PC = line : null; }
    CALL        (tgt: R, func: R, thís: R, args: R) { this[tgt] = this[func].apply(this[thís], this[args]); }
    async THROW (err: R) { this.ERR = this[err]; throw this.ERR; } // TODO: temporary soln... how to really implement this?
    async AWAIT (tgt: R, arg: R) { this[tgt] = await this[arg]; }
    STOP        () { this.PC = Infinity; }

    // Instructions: Data
    STRING      (tgt: R, val: string) { this[tgt] = val; }
    NUMBER      (tgt: R, val: number) { this[tgt] = val; }
    REGEXP      (tgt: R, pattern: string, flags: string) { this[tgt] = new RegExp(pattern, flags); }
    ARRAY       (tgt: R) { this[tgt] = []; }
    OBJECT      (tgt: R) { this[tgt] = {}; }
    TRUE        (tgt: R) { this[tgt] = true; }
    FALSE       (tgt: R) { this[tgt] = false; }
    NULL        (tgt: R) { this[tgt] = null; }
    UNDEFD      (tgt: R) { this[tgt] = void 0; }

    // Registers
    PC          = <any> 0;
    ENV         = void 0;
    ERR         = void 0;
    $0          = void 0;
    $1          = void 0;
    $2          = void 0;
    $3          = void 0;
    $4          = void 0;
    $5          = void 0;
    $6          = void 0;
    $7          = void 0;
}
