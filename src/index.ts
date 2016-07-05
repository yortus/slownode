import Epoch from './epoch';
import Script from './script';





// TODO: temp testing...
export {Epoch, Script};
export default new Epoch();





// TODO: make internal APIs available for testing...
import JASM, {Program} from './script/serialization/jasm';
import KVON from './script/serialization/kvon';
export {JASM, KVON, Program};
