'use strict';
import {Epoch, EpochOptions} from 'slownode';





// TODO: temp testing APIs...
// var slownode2: any;
// let slow2 = slownode2.connect({
//     misc: '',           // onError
//     preproc: 'tsc',     // lib_d_ts
//     storage: 'fs',      // dirname, replacer, reviver
//     runtime: 'blocking' // globalFactory, step, shouldSave
// });
// slow2.execute("'script'");





let slow = new Epoch({
    globalFactory: () => ({
        sleep: ms => new Promise(resolve => setTimeout(resolve, ms)),
        sleepThenFail: (ms, msg) => new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), ms)),
        print: msg => console.log(msg)
    }),
    step: async interpreter => {
        // TODO: should this recurse? Probably not necessary ever... analyse...

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
    }
});


let wf = slow.execute(`
while (true) {
    print('starting...');
    sleep(1000);
    print('after one second...');
    sleepThenFail(1000, 'oops!');
    throw 42;
    print('...finished');
}
`);

wf
    .then(val => {
        console.log('SUCCESS!');
    })
    .catch(err => {
        console.log('FAILURE!');
        console.log(err);
    });

