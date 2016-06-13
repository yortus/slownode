'use strict';
import {EventEmitter} from 'events';
import {createGlobal} from './global';
import EpochOptions from './epoch-options';
import Interpreter from '../jasm/interpreter';
import * as JSONEX from './jsonex';
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
        let interpreter = new Interpreter(jasm, globalObject, park);

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





// TODO: implement properly...
async function park(state: any) {
    let s = JSONEX.stringify(state, replacer);
    console.log(`PARK: ${s}`);

    // TODO: temp testing...
    // - support circular references
    // - support instances of:
    //   - RegExp
    //   - Date
    //   - SleepPromise
    //   - undefined
    //   - NaN
    //   - Infinity
    //   - weird arrays (eg holey, etra props, etc)
    //   - others ???
    // - support special storage of Promise that rejects with 'EpochRestartError' on revival (or ExtinctionError?, UnrevivableError?, RevivalError?)
    function replacer(key: string, value: any) {
        if (value && typeof value.then === 'function') {
            return { _type: 'Promise', value: ['???'] };
        }
        return value;
    }
}
