'use strict';
import Epoch from './workflows/epoch';
import Register from './bytecode/register';





let epoch = new Epoch({
    globalFactory: () => ({
        sleep: ms => new Promise(resolve => setTimeout(resolve, ms)),
        print: msg => console.log(msg)
    }),
    step: async interpreter => {
        // TODO: should this recurse? Probably not necessary ever... analyse...

        // Find a register that contains a Promise instance (if any)
        let register = Object.keys(interpreter.registers)
            .map(name => <Register> interpreter.registers[name])
            .find(reg => reg.value && typeof reg.value.then === 'function');

        if (register) {
            try {
                register.value = await register.value;
            }
            catch (err) {
                register.value = err;
                interpreter.opcodes.THROW(register);
            }
        }

        // NOW step the interpreter
        return interpreter.step();
    }
});


let wf = epoch.add(`
    print('starting...');
    sleep(1000);
    throw 42;
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

