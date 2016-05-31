'use strict';
import Interpreter from '../jasm/interpreter';
import RuntimePlugin from './plugins/runtime-plugin';
export default ServerOptions;





interface ServerOptions {


    // TODO: ...
    runtime?: RuntimePlugin; // TODO: |string|Array<string|RuntimePlugin>...
}










// TODO: was...
// TODO: ...
// interface Options {

//     //========================= MISC =========================
//     // Called if any running script in the epoch throws an unhandled exception. If not provided, do errors just vanish? Or?
//     // TODO: should this callback be passed some sort of reference to the script that errored?
//     onError?: (err: any) => void;


//     //========================= PREPROCESS =========================
//     // If provided, scripts will be interpreted as TypeScript, and type-checked with this file as the lib.d.ts
//     lib_d_ts?: string;


//     //========================= STORAGE =========================
//     // If provided, state will be backed up to / restored from this directory
//     dirname?: string;




//     //========================= RUNTIME =========================
//     // TODO...
//     globalFactory?: () => {};


//     // Custom step() behaviour
//     step?: (jasm: Interpreter) => boolean|Promise<boolean>;


//     // Custom trigger for when to save/park a running script. Also support: 'everyStep', 'never' (default = ???)    
//     shouldSave?: (jasm: Interpreter) => boolean|Promise<boolean>;


//     // Custom serializer for saving running script state
//     replacer?: (this: any, key: string|number, val: any) => any;


//     // Custom deserializer for loading running script state
//     reviver?: (this: any, key: string|number, val: any) => any;

// }
