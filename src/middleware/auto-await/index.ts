'use strict';
import {MiddlewareAPI} from 'slownode/middleware';
import AutoAwaitOptions from './auto-await-options';





// TODO: ...
export default function autoAwait(api: MiddlewareAPI, options: AutoAwaitOptions) {

    let oldCreateInterpreter = api.createInterpreter;
    api.createInterpreter = (script, global) => {

        let interpreter = oldCreateInterpreter(script, global);
        let oldStep = interpreter.step.bind(interpreter);
        interpreter.step = async () => {
            // TODO: should this recurse/iterate? Probably not necessary ever... analyse... document...

            // Find a register that contains a Promise instance (if any)
            let register = Object.keys(interpreter.registers)
                .map(name => interpreter.registers[name])
                .find(reg => reg.value && typeof reg.value.then === 'function');

            if (register) {
                try {
                    register.value = await register.value;
                }
                catch (err) {
                    interpreter.throwInto(err);
                }
            }

            // NOW step the interpreter
            return interpreter.step();
        };
        return interpreter;
    };
}
