'use strict';
import * as slownode from 'slownode';
import {Epoch, MiddlewareOptions} from 'slownode';










// TODO: =========================================
`
// node_modules/zzz/index.d.ts:
export function foo(): string;
export function bar(): string;

// node_modules/zzz/baz.d.ts:
import {foo, bar} from './index';
export interface API {
    baz: boolean;
}
`;

// Augment
declare module 'zzz/baz' {
    interface API {
        extra: number;
    }
}

// All works!
import {foo, bar} from 'zzz';
import * as baz from 'zzz/baz';
foo();
bar();

let api: baz.API;

// TODO: =========================================










let m: MiddlewareOptions;




let x = new Epoch();
x.use({
    test: null,
    xyz: 123,
    fileStore: {
        
    }
});





let slow = slownode.connect({
    runtime: () => ({
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
    })
});


slow.eval(`
    print('starting...');
    sleep(1000);
    print('after one second...');
    sleepThenFail(1000, 'oops!');
    throw 42;
    print('...finished');
`);


slow.on('error', (err, scriptId) => {
    console.log(`Error evaluating script '${scriptId}':`);
    console.log(err);
});
