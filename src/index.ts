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

        let register = Object.keys(interpreter.registers)
            .map(name => <Register> interpreter.registers[name])
            .find(reg => reg.value && typeof reg.value.then === 'function');

        if (register) {
            // TODO: we need a THROW opcode to throw the error -into- the program
            // BUT we definitely DON'T throw/reject here when this is implemented properly...
            register.value = await register.value;
        }

        let result = interpreter.step();
        if (result instanceof Error) throw result;
        return result;
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

