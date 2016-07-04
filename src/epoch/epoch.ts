import {EventEmitter} from 'events';
import EpochOptions from './epoch-options';
import Script from '../script';





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
    eval(source: string, scriptId?: string) {
        scriptId = scriptId || '«unidentified script»';

        // TODO: ...
        let script = new Script(source);

        // TODO: Kick off script using an IIAFE...
        // TODO: do we need to keep a reference to the script/jasm/interpreter/progress after this? Why? Why not?
        (async () => {
            // TODO: run to completion...
            try {
                // TODO: saving at await points...
                for (let step of script) {
                    await step;

                    let instr = script.program.lines[script.registers.get('PC')];
                    let shouldPark = instr.type === 'instruction' && instr.opcode.toUpperCase() === 'AWAIT';

                    if (shouldPark) {
                        let snapshot = script.snapshot();
// TODO: temp testing...
console.log(`\n\n\n\n\n################################################################################`);
console.log(`PARK:\n${snapshot}`);
let o = Script.fromSnapshot(snapshot).registers;
console.log(`\n\nUNPARK:`);
console.log(o);
                    }                    
                }
            }
            catch (err) {
                this.emit('error', err, scriptId);
            }
        })();
    }
}
