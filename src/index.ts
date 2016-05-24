'use strict';
import Epoch from './workflows/epoch';
import Register from './bytecode/register';





let epoch = new Epoch({
    globalFactory: () => ({
        sleep: ms => new Promise(resolve => setTimeout(resolve, ms)),
        print: msg => console.log(msg)
    }),
    step: interpreter => {
        // TODO: should this recurse? Probably not necessary ever... analyse...
        let prestep: Promise<void>;
        let register = Object.keys(interpreter.registers)
            .map(name => <Register> interpreter.registers[name])
            .find(reg => reg.value && typeof reg.value.then === 'function');
        if (register) {
            prestep = register.value
                .then(val => {
                    register.value = val;
                    return null;
                })
                .catch(err => {
                    // TODO: we need a THROW opcode to throw the error -into- the program
                    // BUT we definitely DON'T throw/reject here when this is implemented properly...
                    throw new Error(`Not implemented`);
                });
        }
        else {
            prestep = Promise.resolve(null);
        }
        return prestep
            .then(() => {
                let result = interpreter.step();
                return result instanceof Error ? Promise.reject<boolean>(result) : Promise.resolve(result);
            })
            .catch(err => {
                // TODO: see comments above...
                throw new Error(`internal error: prestep should NEVER reject`);
            });
    }
});


let wf = epoch.add(`
    print('starting...');
    sleep(1000);
    print('...finished');
`);

wf
    .then(val => {
        console.log('SUCCESS!');
    })
    .catch(err => {
        console.log('FAILURE!');
        console.log(err);
    });

