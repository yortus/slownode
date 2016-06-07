'use strict';
import {EventEmitter} from 'events';
import EpochOptions from './epoch-options';
import Interpreter from '../jasm/interpreter';
import transpile from '../js-to-jasm/transpile';





// TODO: ...
export default class Epoch extends EventEmitter {


    // TODO: ...
    constructor() {
        super();
    }


    // TODO: why allow this, separate from constructor? Ans: so 'default' Epoch can be configured. Then maybe just support that instance specially... Seems an antipattern at present...
    init(options: EpochOptions) {
        options = options || {};

        // TODO: add support for all options here...
        if (options.createGlobal) {
            this.createGlobal = options.createGlobal;
        }

        // TODO: load/revive running scripts from storage...
    }


    // TODO: ...
    eval(script: string, scriptId?: string) {

        scriptId = scriptId || '«unidentified script»';
        let jasm = transpile(script);
        let globalObject = this.createGlobal();
        let interpreter = new Interpreter(jasm, globalObject);

        // TODO: do we need to keep a reference to the script/jasm/interpreter/progress after this? Why? Why not?
        (async () => {
            // TODO: run to completion...
            try {
                // TODO: step() is NOT async... are we adding an AWAIT opcode? Changing step() to return a promise?
                // TODO: saving at await points...
                while (!(await autoAwaitStep(interpreter))) {/* no-op */}
            }
            catch (err) {
                this.emit('error', err, scriptId);
            }
        })();

    }


    // TODO: ...
    createGlobal() {
        return {}; // TODO: what 'global' to return by default??
    }    
}










// TODO: temp testing...
async function autoAwaitStep(interpreter: Interpreter) {

    if (interpreter.step()) return true;

    // Find a register that contains a Promise instance (if any).
    // TODO: doc... there can be at most one such register... explain why...
    let register = Object.keys(interpreter.registers)
        .map(name => interpreter.registers[name])
        .find(reg => reg.value && typeof reg.value.then === 'function');

    // TODO: ...
    if (register) {
        try {
            register.value = await register.value;
        }
        catch (err) {
            interpreter.throwInto(err); // TODO: what to do after this?
        }
    }

    // TODO: ...
    return false;
}
