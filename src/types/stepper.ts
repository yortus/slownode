import {Program} from '../formats/jasm';
import RegisterSet from './register-set';





// TODO: doc... expand...
export default StepperType;
interface StepperType extends Iterator<Promise<void>> {

    // TODO: doc...
    program: Program;

    // TODO: doc...
    registers: RegisterSet; // TODO: could theoretically expose instruction set too... but why?

    // TODO: doc... The JASM string is invariant in a stepper - would be a big optimisation to cache this in the
    // instance rather than repeatedly re-computing it with JASM#stringify.
    //jasm: string;
}
