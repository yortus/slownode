import {createGlobal, isGlobal} from '../../formats/stepper/global-object';
import InstructionSet from '../../formats/jasm/instruction-set';
import Jasm from '../../formats/jasm';
import * as JSON3000 from '../../json3000/index'; // TODO: explicit index, so it works with AMD too
import {parse} from './jasm-parser';
import Register from '../../formats/jasm/register';
import RegisterSet from '../../formats/jasm/register-set';





// TODO: ...
export default function jasmToStepper(jasm: Jasm): Stepper {
    let globalObject = createGlobal();
    let stepper = new Stepper(jasm, globalObject, tempPark);
    return stepper;
}





// TODO: ...
export class Stepper {


    // TODO: ...
    constructor(jasm: Jasm, globalObject?: {}, park?: (state: any) => Promise<void>) {
        park = park || (async () => {});
        this.jasm = jasm;
        let virtualMachine = this._virtualMachine = makeVirtualMachine(park);
        let registers = this.registers = <any> virtualMachine;
        registers.ENV.value = globalObject || {};
        this.step = makeStepFunction(jasm, virtualMachine);
    }


    // TODO: doc... unhandled exceptions in the script will be thrown here...
    // TODO: what if step() is called again after jasm finished/errored? Expected behaviour? Undefined behaviour for now...
    step: () => Promise<boolean>;


    // TODO: doc... does this need to otherwise work like step(), return a value, etc? I think not, but think about it...
    throwInto(err: any) {
        let reg = new Register('temp', err);
        this._virtualMachine.THROW(reg);
    }


    // TODO: ...
    jasm: Jasm;


    // TODO: ...
    registers: RegisterSet & {[name: string]: Register};


    // TODO: ...
    private _virtualMachine: InstructionSet & RegisterSet;
}





// TODO: implement properly...
async function tempPark(state: any) {
    let s = JSON3000.stringify(state, replacer, 4);
    console.log(`PARK: ${s}`);
// TODO: temp testing...
let o = JSON3000.parse(s, reviver);
console.log(`UNPARK:`);
console.log(o);


    // TODO: temp testing...
    // - support special storage of Promise that rejects with 'EpochRestartError' on revival (or ExtinctionError?, UnrevivableError?, RevivalError?)
    function replacer(key: string, val: any) {
        if (isGlobal(val)) {
            let keys = Object.keys(val);
            return { $type: 'Global', props: keys.reduce((props, key) => (props[key] = val[key], props), {}) };
        }
        if (val && typeof val.then === 'function') {
            return { $type: 'Promise', value: ['???'] };
        }
        return val;
    }
    function reviver(key: string, val: any) {
        if (!val || Object.getPrototypeOf(val) !== Object.prototype || ! val.$type) return val;
        if (val.$type === 'Global') {
            let g = createGlobal();
            Object.keys(val.props).forEach(key => g[key] = val.props[key]);
            return g;
        }
        else if (val.$type === 'Promise') {
            return Promise.resolve(42);
        }
        return val;
    }
}






// TODO: ...
function makeStepFunction(jasm: Jasm, virtualMachine: InstructionSet & RegisterSet) {

    let ast = parse(jasm);

    // TODO: Associate each label with it's one-based line number...
    let labels = ast.code.reduce((labels, line, i) => {
        if (line.type === 'label') labels[line.name] = i + 1;
        return labels;
    }, {});

    // TODO: ...
    let codeLines = ast.code.map(line => {
        switch (line.type) {
            case 'blank':
                return `// ${line.comment}`;
            case 'label':
                return `// ${line.name}:`;
            case 'instruction':
                return `${line.opcode.toUpperCase()}(${line.arguments.map(arg => {
                    switch (arg.type) {
                        case 'register':
                            return arg.name;
                        case 'label':
                            return labels[arg.name];
                        case 'const':
                            return JSON.stringify(arg.value);
                        default:
                            // NB: Runtime exhaustiveness check. We can only get here if argument types were added to other code but not here.
                            throw new Error(`Unhandled JASM instruction argument type`);
                    }
                })})`;
            default:
                // NB: Runtime exhaustiveness check. We can only get here if lines types were added to other code but not here.
                throw new Error(`Unhandled JASM code line type`);
        }
    });

    // TODO: re-format lines as switch cases...
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
            result += `case ${`${i+1}:    `.slice(0, 6)} p = ${line};`;
            result += ' '.repeat(Math.max(0, 74 - result.length)) + 'break;';
        }
        lines.push(result);
        prevIsCommentLine = isCommentLine;
    });

    // TODO: Eval up the step() function...
    // TODO: what if an THROW/AWAIT op rejects? It's not handled properly in the current VM code...
    let makeCode = new Function('vm', `
        with (vm) return (() => {
            let p;
            switch (PC.value++) {
                ${lines.map(line => `${' '.repeat(16)}${line}`).join('\n').slice(16)}
            }
            return Promise.resolve(p).then(() => PC.value > ${codeLines.length});
        })`);
    let result: () => Promise<boolean> = makeCode(virtualMachine);

    // TODO: temp testing... remove...
    console.log(result.toString())
    return result;
}





// TODO: ...
function makeVirtualMachine(park: (state: any) => Promise<void>): InstructionSet & RegisterSet {
    let virtualMachine: InstructionSet & RegisterSet = <any> {};
    makeRegisters(virtualMachine);
    makeInstructions(virtualMachine, virtualMachine.PC, park);
    return virtualMachine;
}




// TODO: ...
function makeInstructions(target: InstructionSet, pc: Register, park: (state: any) => Promise<void>) {
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
        UNDEFD:   (tgt) => { tgt.value = void 0; },

        // Meta
        PARK:   (...regs) => park(regs.reduce((state, reg) => (state[reg.name] = reg.value, state), {}))
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
