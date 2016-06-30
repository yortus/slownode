import JASM, {Program} from '../serialization/jasm/index';  // TODO: explicit index, so it works with AMD too
import makeNextFunction from './make-next-function';
import VirtualMachine, {Register, registerNames} from '../virtual-machine';





// TODO: ...
export default class Stepper {


    // TODO: ...
    constructor(jasm: string, globalObject?: {}) {
        this._jasm = jasm;
        let program = this.program = JASM.parse(jasm);
        let vm = this._virtualMachine = new VirtualMachine();
        let registers = this.registers = <any> registerNames.reduce((regs, n) => (regs[n] = vm[n], regs), {});
        registers.ENV.value = globalObject || {};
        this.next = makeNextFunction(program, vm);
        // TODO: add -->?: this.throw = makeThrowFunction(program, vm);
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
    registers: { ENV: Register, PC: Register, [name: string]: Register};


    // TODO: ...
    private _virtualMachine: VirtualMachine;


    // TODO: ...
    private _jasm: string;
}
