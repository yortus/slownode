'use strict';
import {EventEmitter} from 'events';
import createGlobal from './create-global';
import EpochOptions from './epoch-options';
import Interpreter from '../jasm/interpreter';
import {staticCheck} from './static-check';
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

        // TODO: load/revive running scripts from storage...
    }


    // TODO: ...
    eval(script: string, scriptId?: string) {
        scriptId = scriptId || '«unidentified script»';

        // TODO: temp testing... do static checking...
        let valid = staticCheck(script, (msg, line, col) => {
            console.log(`L${line}C${col}   ${msg}`);
            // TODO: should be... this.emit('error', `L${line}C${col}   ${msg}`, scriptId);
        });
        if (!valid) {
            return;
        }

        // TODO: ...
        let jasm = transpile(script);
        let globalObject = createGlobal();
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
}
