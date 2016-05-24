'use strict';
import Interpreter from '../bytecode/interpreter';
import Workflow from './workflow';
export default EpochOptions;





// TODO: ...
interface EpochOptions {


    // If provided, scripts will be interpreted as TypeScript, and type-checked with this file as the lib.d.ts
    lib_d_ts?: string;


    // If provided, state will be backed up to / restored from this directory
    dirname?: string;


    // Called if any workflow in the epoch throws an unhandled exception. If not provided, do errors just vanish? Or?
    onError?: (err: any, workflow: Workflow) => void;


    // TODO...
    globalFactory?: () => {};


    // Custom step() behaviour
    step?: (interpreter: Interpreter) => Promise<boolean|Error>;


    // Custom trigger for when to save/park a workflow. Also support: 'everyStep', 'never' (default = ???)    
    shouldSave?: (interpreter: Interpreter) => boolean|Promise<boolean>;


    // Custom serializer for saving workflow state
    replacer?: Function;


    // Custom deserializer for loading workflow state
    reviver?: Function;
}
