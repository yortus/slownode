// TODO: doc JASM (in README?)
// - blah...
import parse from './parse';
import Program, {OpCode, InstructionLine} from './program';
import stringify from './stringify';





// TODO: the JASM object...
let JASM = { stringify, parse };
export default JASM;





// TODO: ... export ALL types? currently a bit arbitrary what is exported here...
export {Program, OpCode, InstructionLine};
