'use strict';
import Interpreter from '../bytecode/interpreter';
export default WorkflowOptions;





interface WorkflowOptions {
    filename?: string;
    preStep?: (interpreter: Interpreter) => void|Promise<void>;
    postStep?: (interpreter: Interpreter) => void|Promise<void>;
}
