import InstructionSet from '../types/instruction-set';
import JASM, {Program} from '../formats/jasm/index'; // TODO: explicit index, so it works with AMD too
import KVON from '../formats/kvon/index'; // TODO: explicit index, so it works with AMD too
import makeNextFunction from './make-next-function';
import makeVirtualMachine from './make-virtual-machine';
import Register from '../types/register';
import RegisterSet from '../types/register-set';





export default class Stepper {


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
