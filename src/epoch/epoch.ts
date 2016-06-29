import {createGlobal, isGlobal} from '../global-object/global-object';
import {EventEmitter} from 'events';
import EpochOptions from './epoch-options';
import Stepper from '../stepper';
import typeScriptToJasm from '../typescript-to-jasm';





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

        // TODO: ...
        let jasm = typeScriptToJasm(script);
        let globalObject = createGlobal();
        let stepper = new Stepper(jasm, globalObject, tempPark);

        // TODO: Kick off script using an IIAFE...
        // TODO: do we need to keep a reference to the script/jasm/interpreter/progress after this? Why? Why not?
        (async () => {
            // TODO: run to completion...
            try {
                // TODO: saving at await points...
                while (true) {
                    let it = stepper.next();
                    if (it.done) return;
                    await it.value;
                }
            }
            catch (err) {
                this.emit('error', err, scriptId);
            }
        })();
    }
}










// TODO: implement properly...
import KVON from '../formats/kvon/index'; // TODO: explicit index, so it works with AMD too
async function tempPark(state: any) {
    let s = KVON.stringify(state, replacer, 4);
    console.log(`PARK: ${s}`);
// TODO: temp testing...
let o = KVON.parse(s, reviver);
console.log(`UNPARK:`);
console.log(o);


    // TODO: temp testing...
    // - support special storage of Promise that rejects with 'EpochRestartError' on revival (or ExtinctionError?, UnrevivableError?, RevivalError?)
    function replacer(key: string, val: any) {
        if (isGlobal(val)) {
            let keys = Object.keys(val);
            return { $type: 'Global', props: keys.reduce((props, key) => (props[key] = val[key], props), {}) };
        }
        if (val && typeof val.then === 'function') {
            return { $type: 'Promise', value: ['???'] };
        }
        return val;
    }
    function reviver(key: string, val: any) {
        if (!val || Object.getPrototypeOf(val) !== Object.prototype || ! val.$type) return val;
        if (val.$type === 'Global') {
            let g = createGlobal();
            Object.keys(val.props).forEach(key => g[key] = val.props[key]);
            return g;
        }
        else if (val.$type === 'Promise') {
            return Promise.resolve(42);
        }
        return val;
    }
}
