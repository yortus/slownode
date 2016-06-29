import {createGlobal, isGlobal} from '../../global-object/global-object';
import InstructionSet from '../../types/instruction-set';
import JASM from '../../formats/jasm/index'; // TODO: explicit index, so it works with AMD too
import KVON from '../../formats/kvon/index'; // TODO: explicit index, so it works with AMD too
import makeVirtualMachine from './make-virtual-machine';
import Register from '../../types/register';
import RegisterSet from '../../types/register-set';
import Stepper from '../../types/stepper';





// TODO: ...
export default function jasmToStepper(jasm: string): Stepper {
    let globalObject = createGlobal();
    let stepper = new StepperImpl(jasm, globalObject, tempPark);
    return stepper;
}





// TODO: ...
class StepperImpl implements Stepper {


    // TODO: ...
    constructor(jasm: string, globalObject?: {}, park?: (state: any) => Promise<void>) {
        park = park || (async () => {});
        this.jasm = jasm;
        let virtualMachine = this._virtualMachine = makeVirtualMachine(park);
        let registers = this.registers = <any> virtualMachine;
        registers.ENV.value = globalObject || {};
        this.next = makeNextFunction(jasm, virtualMachine);
    }


    // TODO: doc... unhandled exceptions in the script will be thrown here...
    // TODO: what if step() is called again after jasm finished/errored? Expected behaviour? Undefined behaviour for now...
    next: () => IteratorResult<Promise<void>>;


    // TODO: doc... does this need to otherwise work like step(), return a value, etc? I think not, but think about it...
    throw(err: any): IteratorResult<Promise<void>> {
        let reg: Register = {name: 'temp', value: err}; // TODO: this creates a non-existent register. Better way? Is this reliable?
        this._virtualMachine.THROW(reg); // TODO: this executes an instruction that is not in the JASM program. What happens to PC, etc??
        // TODO: ^ will throw back at caller if JASM program doesn't handle it
        // TODO: is JASM program *does* handle it, what should we return from here?
        // TODO: temp just for now...
        return { done: false, value: Promise.resolve() };
    }


    // TODO: ...
    jasm: string;


    // TODO: ...
    registers: RegisterSet & {[name: string]: Register};


    // TODO: ...
    private _virtualMachine: InstructionSet & RegisterSet;
}





// TODO: implement properly...
async function tempPark(state: any) {
    let s = KVON.stringify(state, replacer, 4);
    console.log(`PARK: ${s}`);
// TODO: temp testing...
let o = KVON.parse(s, reviver);
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
function makeNextFunction(jasm: string, virtualMachine: InstructionSet & RegisterSet): () => IteratorResult<Promise<void>> {

    let ast = JASM.parse(jasm);

    // TODO: Associate each label with it's one-based line number...
    let labels = ast.lines.reduce((labels, line, i) => {
        if (line.type === 'label') labels[line.name] = i + 1;
        return labels;
    }, {});

    // TODO: ...
    let codeLines = ast.lines.map(line => {
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
            let done = PC.value > ${codeLines.length}; // If done, must have seen STOP instruction
            let result = { done, value: done ? void 0 : Promise.resolve(p) };
            return result;
        })`);
    let result: () => IteratorResult<Promise<void>> = makeCode(virtualMachine);

    // TODO: temp testing... remove...
    console.log(result.toString())
    return result;
}
