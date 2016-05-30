'use strict';
import InstructionSet from './instruction-set';
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
        this.step = makeStepFunction(jasm.code, virtualMachine);
    }


    // TODO: doc... unhandled exceptions in the script will be thrown here...
    // TODO: what if step() is called again after jasm finished/errored? Expected behaviour? Undefined behaviour for now...
    step: () => boolean;


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
}





// TODO: ...
function makeStepFunction(codeLines: string[], virtualMachine: InstructionSet & RegisterSet) {

    // TODO: re-format lines as switch cases
    let lines: string[] = [];
    let prevIsCommentLine = false;
    codeLines.forEach((line, i) => {
        let isCommentLine = line.startsWith('//');
        let result = '';
        if (isCommentLine) {
            if (!prevIsCommentLine) lines.push('');
            result += `            ${line}`;
        }
        else {
            result += `case ${`${i+1}:    `.slice(0, 6)} ${line};`;
            result += ' '.repeat(Math.max(0, 74 - result.length)) + 'break;';
        }
        lines.push(result);
        prevIsCommentLine = isCommentLine;
    });

    let makeCode = new Function('vm', `
        with (vm) return (() => {
            switch (PC.value++) {
                ${lines.map(line => `${' '.repeat(16)}${line}`).join('\n').slice(16)}
            }
            return PC.value > ${codeLines.length};
        })`);
    let result: () => boolean = makeCode(virtualMachine);

// TODO: temp testing... remove...
//console.log(result.toString())

    return result;
}





// TODO: ...
function makeVirtualMachine(): InstructionSet & RegisterSet {
    let virtualMachine: InstructionSet & RegisterSet = <any> {};
    makeRegisters(virtualMachine);
    makeInstructions(virtualMachine, line => virtualMachine.PC.value = +line);
    return virtualMachine;
}




// TODO: ...
function makeInstructions(target: InstructionSet, goto: (line: number) => void) {

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
        B:      (line: number) => goto(line),
        BF:     (line: number, arg) => arg.value ? null : goto(line),
        BT:     (line: number, arg) => arg.value ? goto(line) : null,
        CALL:   (tgt, func, thís, args) => tgt.value = func.value.apply(thís.value, args.value),
        THROW:  (err) => { throw err.value; }, // TODO: temporary soln... how to really implement this?
        STOP:   () => goto(Infinity),

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

    // TODO: copy to target...
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

    // TODO: copy to target...
    Object.keys(registers).forEach(key => {
        target[key] = registers[key];
    });
}
