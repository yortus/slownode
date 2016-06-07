'use strict';
import slownode, {Epoch} from 'slownode';






// TODO: ...
slownode.init({
    storage: {
        type: 'file',
        dirname: './slowfiles'
    },
    createGlobal: () => ({
        sleep: ms => new Promise(resolve => setTimeout(resolve, ms)),
        sleepThenFail: (ms, msg) => new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), ms)),
        print: msg => console.log(msg)
    }),
    replacer: null,
    reviver: null,
});


slownode.eval(`
    print('starting...');
    await sleep(1000);
    print('after one second...');
    await sleepThenFail(1000, 'oops!');
    throw 42;
    print('...finished');
`);


slownode.on('error', (err, scriptId) => {
    console.log(`Error evaluating script '${scriptId}':`);
    console.log(err);
});
