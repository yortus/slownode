'use strict';
import InstructionSet from './instruction-set';
import Label from './label';
import ObjectCode from './object-code';
import Register from './register';
import RegisterSet from './register-set';





// TODO: ...
export default class Interpreter {


    // TODO: ...
    constructor(jasm: ObjectCode, globalObject?: {}) {
        this.jasm = jasm;
        let virtualMachine = this._virtualMachine = makeVirtualMachine();
        let registers = this.registers = <any> virtualMachine;
        registers.ENV.value = globalObject || {};
        let code = this._code = compile(jasm.code, virtualMachine);
    }


    // TODO: doc... unhandled exceptions in the script will be thrown here...
    // TODO: we are using exceptions for control flow in here. How awesome/insane is that? Non-rhetorical question...
    // TODO: what if step() is called again after jasm finished/errored? Expected behaviour? Undefined behaviour for now...
    step(): boolean {
        try {
            this._code();
            return false;
        }
        catch (err) {
            let ex: Error = err; // workaround for TS1196 (see https://github.com/Microsoft/TypeScript/issues/8677)
            if (ex instanceof Jump) {
                // TODO: update the PC ready for the next call, and return to host...
                this.registers.PC.value = +ex.label.toString();
                return false;
            }
            else if (ex instanceof Done) {
                // TODO: jasm completed without (uncaught) error...
                return true;
            }
            else {
                // TODO: uncaught error - surface it to the host...
                throw err;
            }
        }
    }


    // TODO: doc... does this need to otherwise work like step(), return a value, etc? I think not, but think about it...
    throwInto(err: any) {
        let reg = new Register('temp', err);
        this._virtualMachine.THROW(reg);
    }


    // TODO: ...
    jasm: ObjectCode;


    // TODO: ...
    registers: RegisterSet & {[name: string]: Register};


    // TODO: ...
    private _virtualMachine: InstructionSet & RegisterSet;


    // TODO: ...
    private _code: () => void;
}





// TODO: ...
function compile(codeLines: string[], virtualMachine: InstructionSet & RegisterSet) {


    // TODO: doc...
    // codeLines = codeLines.map((line, i) => {
    //     return `        case ${`${i+1}:    `.slice(0, 6)} ${line}`;
    // });
    // let func = `(() => {\n    switch (PC.value) {\n${codeLines.join('\n')}\n    }\n})`;
// TODO: add default case to catch illegal PC values (this is an internal error - should never happen, but may do during dev - goes into infinite loop otherwise)


    // TODO: reformat lines as switch cases
    let lines = codeLines.map((line, i) => {
        let isFirstLine = i === 0;
        let isCommentLine = line.startsWith('//');
        let result = isFirstLine ? '' : '                ';
        result += `case ${`${i+1}:    `.slice(0, 6)} `;
        result += isCommentLine ? `NOOP(); break;    ${line}` : `${line}; break;`;
        return result;
    });

    let makeCode = new Function('vm', `
        with (vm) return (() => {
            debugger;
            switch (PC.value) {
                ${lines.join('\n')}
                default:    throw new Error('Illegal PC value');
            }
            ++PC.value;
        })`);
    let result: () => void = makeCode(virtualMachine);

// TODO: temp testing...
console.log(result.toString())

    return result;
}





// TODO: ...
function makeVirtualMachine(): InstructionSet & RegisterSet {
    let virtualMachine: InstructionSet & RegisterSet = <any> {};
    let instructions = makeInstructions(virtualMachine);
    let registers = makeRegisters(virtualMachine);
    return virtualMachine;
}




// TODO: ...
function makeInstructions(target: InstructionSet) {

    let instructions: InstructionSet = {

        // Load/store
        LOAD:   (tgt, obj, key) => tgt.value = obj.value[key.value],
        STORE:  (obj, key, src) => obj.value[key.value] = src.value,

        // Arithmetic/logic
        ADD:    (tgt, lhs, rhs) => tgt.value = lhs.value + rhs.value,
        SUB:    (tgt, lhs, rhs) => tgt.value = lhs.value - rhs.value,
        MUL:    (tgt, lhs, rhs) => tgt.value = lhs.value * rhs.value,
        DIV:    (tgt, lhs, rhs) => tgt.value = lhs.value / rhs.value,
        NEG:    (tgt, arg) => tgt.value = -arg.value,
        NOT:    (tgt, arg) => tgt.value = !arg.value,

        // Relational
        EQ:     (tgt, lhs, rhs) => tgt.value = lhs.value === rhs.value,
        GE:     (tgt, lhs, rhs) => tgt.value = lhs.value >= rhs.value,
        GT:     (tgt, lhs, rhs) => tgt.value = lhs.value > rhs.value,
        LE:     (tgt, lhs, rhs) => tgt.value = lhs.value <= rhs.value,
        LT:     (tgt, lhs, rhs) => tgt.value = lhs.value < rhs.value,
        NE:     (tgt, lhs, rhs) => tgt.value = lhs.value !== rhs.value,

        // Control
        B:      (label) => jumpTo(label),
        BF:     (label, arg) => arg.value ? null : jumpTo(label),
        BT:     (label, arg) => arg.value ? jumpTo(label) : null,
        CALL:   (tgt, func, thís, args) => tgt.value = func.value.apply(thís.value, args.value),
        NOOP:   () => { },
        THROW:  (err) => { throw err.value; }, // TODO: temporary soln... how to really implement this?
        QUIT:   () => { throw new Done(); },

        // Data
        STRING: (tgt, val) => tgt.value = val,
        NUMBER: (tgt, val) => tgt.value = val,
        REGEXP: (tgt, pattern, flags) => tgt.value = new RegExp(pattern, flags),
        ARRAY:  (tgt) => tgt.value = [],
        OBJECT: (tgt) => tgt.value = {},
        TRUE:   (tgt) => tgt.value = true,
        FALSE:  (tgt) => tgt.value = false,
        NULL:   (tgt) => tgt.value = null
    };

    function jumpTo(label: Label) {
        // TODO: scope enter/exit, finally blocks
        throw new Jump(label);
    }

    // Inject prolog/epilog into all methods
    Object.keys(instructions).forEach(key => {
        target[key] = instructions[key];
    });
}





// TODO: ...
function makeRegisters(target: RegisterSet) {

    let registers: RegisterSet = {
        // TODO: add ERR register for exception in flight? (can only be one)
        PC:     new Register('PC', 1),
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

    Object.keys(registers).forEach(key => {
        target[key] = registers[key];
    });
}





// TODO: ...
class Jump extends Error {
    constructor(public label: Label) { super(); }
}
class Done extends Error { }
