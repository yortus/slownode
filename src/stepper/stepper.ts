import JASM, {Program} from '../serialization/jasm/index';  // NB: explicit 'index' so loadable by both CJS & AMD
import makeNextFunction from './make-next-function';
import ExecutionEngine, {Register} from '../execution-engine/index'; // NB: explicit 'index' so loadable by both CJS & AMD





// TODO: ...
export default class Stepper {


    // TODO: ...
    constructor(jasm: string, globalObject?: {}) {
        this._jasm = jasm;
        let program = this.program = JASM.parse(jasm);
        let engine = this._engine = new ExecutionEngine();
        let registers = this.registers = engine.registers;
        registers.set('ENV', globalObject || {});
        this.next = makeNextFunction(program, engine);
        // TODO: add -->?: this.throw = makeThrowFunction(program, vm);
    }


    // TODO: doc... unhandled exceptions in the script will be thrown here...
    // TODO: what if step() is called again after jasm finished/errored? Expected behaviour? Undefined behaviour for now...
    next: () => IteratorResult<Promise<void>>;


    // TODO: doc... does this need to otherwise work like step(), return a value, etc? I think not, but think about it...
    throw(err: any): IteratorResult<Promise<void>> {
        this.registers.set('ERR', err);
        this._engine.THROW('ERR'); // TODO: this executes an instruction that is not in the JASM program. What happens to PC, etc??
        // TODO: ^ will throw back at caller if JASM program doesn't handle it
        // TODO: is JASM program *does* handle it, what should we return from here?
        // TODO: temp just for now...
        return { done: false, value: Promise.resolve() };
    }


    // TODO: ...
    program: Program;


    // TODO: ...
    registers: typeof _registersTypeofKludge;


    // TODO: ...
    private _engine: ExecutionEngine;


    // TODO: ...
    private _jasm: string;
}





// TODO: ...
export var _registersTypeofKludge = 0 && new ExecutionEngine().registers;
