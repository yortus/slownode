import {createGlobal, isGlobal} from '../../global-object/global-object';
import InstructionSet from '../../types/instruction-set';
import JASM, {Program} from '../../formats/jasm/index'; // TODO: explicit index, so it works with AMD too
import KVON from '../../formats/kvon/index'; // TODO: explicit index, so it works with AMD too
import makeNextFunction from './make-next-function';
import makeVirtualMachine from './make-virtual-machine';
import Register from '../../types/register';
import RegisterSet from '../../types/register-set';
import StepperType from '../../types/stepper';





// TODO: ...
export default function jasmToStepper(jasm: string): StepperType {
    let globalObject = createGlobal();
    let stepper = new Stepper(jasm, globalObject, tempPark);
    return stepper;
}





// TODO: ...
class Stepper implements StepperType {


    // TODO: ...
    constructor(jasm: string, globalObject?: {}, park?: (state: any) => Promise<void>) {
        park = park || (async () => {});
        let program = this.program = JASM.parse(jasm);
        let virtualMachine = this._virtualMachine = makeVirtualMachine(park);
        let registers = this.registers = <any> virtualMachine;
        registers.ENV.value = globalObject || {};
        this.next = makeNextFunction(program, virtualMachine);
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
    program: Program;


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
