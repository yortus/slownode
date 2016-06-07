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
                // TODO: saving at await points...
                while (!(await interpreter.step())) {/* no-op */}
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
