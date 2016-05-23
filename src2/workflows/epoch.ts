'use strict';
import Interpreter from '../bytecode/interpreter';





class Workflow extends Promise<void> {
    // other details...
}





declare class Epoch {


    constructor(options: EpochOptions);


    add(script: string): Workflow;


    workflows: Workflow[];


    // And possibly:
    // start(): void;
    // stop(): void;
    // destroy(): void;
}





// TODO: concept of parking:
// - if a saved workflow is not 'parked', it can't be resumed
interface EpochOptions {

    // If provided, scripts will be interpreted as TypeScript, and type-checked with this file as the lib.d.ts
    lib_d_ts?: string;

    // If provided, state will be backed up to / restored from this directory
    dirname?: string;

    // Called if any workflow in the epoch throws an unhandled exception. If not provided, do errors just vanish? Or?
    onError?: (err: any, workflow: Workflow) => void;


    
    step?: (interpreter: Interpreter) => void|Promise<void>;

    shouldSave?: (interpreter: Interpreter) => boolean|Promise<boolean>;

    replacer?: Function;

    reviver?: Function;


    // More options:
    // - custom step() behaviour
    // - custom trigger for when to save/park a workflow. Also support: 'everyStep', 'never' (default = ???)    
    // - custom serializer for saving workflow state
    // - custom deserializer for loading workflow state
}
