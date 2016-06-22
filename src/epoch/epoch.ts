import {EventEmitter} from 'events';
import EpochOptions from './epoch-options';
import {typeScriptToJasm, jasmToStepper} from '../converters';





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
        let stepper = jasmToStepper(jasm);

        // TODO: do we need to keep a reference to the script/jasm/interpreter/progress after this? Why? Why not?
        (async () => {
            // TODO: run to completion...
            try {
                // TODO: saving at await points...
                while (!(await stepper.step())) {/* no-op */}
            }
            catch (err) {
                this.emit('error', err, scriptId);
            }
        })();
    }
}
