import globalFactory from '../script/global-factories/default';
import {EventEmitter} from 'events';
import EpochOptions from './epoch-options';
import Stepper from '../stepper';
import * as typescript from '../script/source-languages/typescript';





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
        let jasm = typescript.transpileToJasm(script);
        let globalObject = globalFactory.create();
        let stepper = new Stepper(jasm, globalObject);

        // TODO: Kick off script using an IIAFE...
        // TODO: do we need to keep a reference to the script/jasm/interpreter/progress after this? Why? Why not?
        (async () => {
            // TODO: run to completion...
            try {
                // TODO: saving at await points...
                while (true) {
                    let instr = stepper.program.lines[stepper.registers.get('PC')];
                    let shouldPark = instr.type === 'instruction' && instr.opcode.toUpperCase() === 'AWAIT';

                    if (shouldPark) {
                        await tempPark(stepper);
                    }                    

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
import JASM from '../script/serialization/jasm';
import KVON from '../script/serialization/kvon';
async function tempPark(stepper: Stepper) {

    // TODO: temp testing...
    const regNames = [...stepper.registers.keys()];
    let state = regNames.reduce((state, name) => (state[name] = stepper.registers.get(name), state), {});

    // TODO: temp testing...
    let code = JASM.stringify(stepper.program);
    let data = KVON.stringify(state, globalFactory.replacer, 4);
    let s = `.CODE\n${code}\n\n\n\n\n.DATA\n${data}`;
    console.log(`\n\n\n\n\n################################################################################`);
    console.log(`PARK: ${s}`);


    // TODO: temp testing... what about JASM?
    let o = KVON.parse(data, globalFactory.reviver);
    console.log(`\n\nUNPARK:`);
    console.log(o);
}
