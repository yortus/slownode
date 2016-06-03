'use strict';
import Interpreter from '../jasm/interpreter';
import ObjectCode from '../jasm/object-code';
import RegisterSet from '../jasm/register-set';
export default ExtensibilityAPI;





// TODO: ...
interface ExtensibilityAPI {

    // TODO: ...
    init?: () => void|Promise<void>;

    // TODO: ...
    createGlobal?: () => {};

    // TODO: ...
    step?: (interpreter: Interpreter) => Promise<boolean>;
    
    // TODO: ...
    load?: (jasm: ObjectCode, registers: RegisterSet) => void|Promise<void>;

    // TODO: ...
    save?: (jasm: ObjectCode, registers: RegisterSet) => void|Promise<void>;
}
