'use strict';
import Opcodes from './opcodes';
import Program from './program';
import Register from './register';
import Registers from './registers';





// TODO: ...
export default class Interpreter {


    // TODO: ...
    constructor(program: Program, globalObject?: {}) {
        this.program = program;
        let opcodes = this.opcodes = makeOpcodes();
        let registers = this.registers = makeRegisters();
        registers.ENV.value = globalObject || {};
        let code = this.code = recompile(program.code, opcodes, registers);
    }


    // TODO: we are using exceptions for control flow in here. How awesome/insane is that? Non-rhetorical question...
    // TODO: what is step() is called again after task finished/errored? Expected behaviour? Undefined behaviour for now...
    step(): boolean|Error {
        try {
            this.code(); // NB: guaranteed to throw...
        }
        catch (err) {
            let ex: Error = err; // workaround for TS1196 (see https://github.com/Microsoft/TypeScript/issues/8677)
            if (ex instanceof Jump) {
                // TODO: update the PC ready for the next call, and return to host...
                this.registers.PC.value = ex.nextLine;
                return false;
            }
            else if (ex instanceof Next) {
                // TODO: update the PC ready for the next call, and return to host...
                ++this.registers.PC.value;
                return false;
            }
            else if (ex instanceof Done) {
                // TODO: task completed without (uncaught) error...
                return true;
            }
            else {
                // TODO: we should probably handle and wrap non-Error errors that may crop up here (eg if task throws a string)
                // TODO: uncaught error - surface it to the host...
                return err;
            }
        }
    }


    // TODO: ...
    program: Program;


    // TODO: ...
    opcodes: Opcodes;


    // TODO: ...
    registers: Registers;


    // TODO: ...
    private code: () => void;
}





function recompile(code: () => void, opcodes: Opcodes, registers: Registers) {
    let makeCode = new Function('code', 'opcodes', 'registers', `with (opcodes) with (registers) return (${code})`);
    let result: () => void = makeCode(code, opcodes, registers);
    return result;
}





// TODO: ...
function makeOpcodes() {

    let opcodes: Opcodes = {
        LOAD:   (tgt, obj, key) => tgt.value = obj.value[key instanceof Register ? key.value : key],
        LOADC:  (tgt, val) => tgt.value = val,
        STORE:  (obj, key, src) => obj.value[key instanceof Register ? key.value : key] = src.value,
        MOVE:   (tgt, src) => tgt.value = src.value,

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

        B:      (line) => jumpTo(line),
        BF:     (line, arg) => arg.value ? null : jumpTo(line),
        BT:     (line, arg) => arg.value ? jumpTo(line) : null,
        CALL:   (tgt, func, thís, args) => tgt.value = func.value.apply(thís.value, args.value),
        THROW:  (err) => { throw err.value; }, // TODO: temporary soln... how to really implement this?
        QUIT:   () => { throw new Done(); },

        NEWARR: (tgt) => tgt.value = [],
        NEWOBJ: (tgt) => tgt.value = {}
    };

    function jumpTo(line: number) {
        // TODO: scope enter/exit, finally blocks
        throw new Jump(line);
    }

    // Inject prolog/epilog into all methods
    Object.keys(opcodes).forEach(key => {
        let oldMethod = opcodes[key];
        let newMethod = (...args) => {
            // TODO: prolog (none for now)
            oldMethod(...args);
            throw new Next();
        }
        opcodes[key] = newMethod;
    });

    return opcodes;
}





function makeRegisters() {

    let registers: Registers = {
        PC:     new Register('PC', 0),
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
    return registers;
}





// TODO: ...
class Jump extends Error {
    constructor(public nextLine: number) { super(); }
}
class Next extends Error { }
class Done extends Error { }
