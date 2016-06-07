'use strict';
//import {Extension, ExtensibilityAPI} from '../extensibility';





// TODO: ...
export default function makeExtension() {
    return api => ({
        step: async interpreter => {


            // TODO: decide!?!?!? We can either call interpreter.step, or api.step. What/why/which? Get rid of one??


            
            while (!(await api.step(interpreter))) {

                // Find a register that contains a Promise instance (if any).
                // TODO: doc... there can be at most one such register... explain why...
                let register = Object.keys(interpreter.registers)
                    .map(name => interpreter.registers[name])
                    .find(reg => reg.value && typeof reg.value.then === 'function');

                // TODO: ...
                if (!register) continue;

                // TODO: ...
                try {
                    register.value = await register.value;
                }
                catch (err) {
                    interpreter.throwInto(err); // TODO: what to do after this?
                }

                // TODO: this is where a step ends and another begins (steps get grouped)
                return false;
            }

            // Script completed.
            return true;
        }
    });
};
