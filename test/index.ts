'use strict';
import slownode, {Epoch, autoAwait} from 'slownode';





slownode.use(autoAwait());

// TODO: ...
slownode.use({
    patch: api => ({
        
    })
});

let globalFactory = () => ({
    sleep: ms => new Promise(resolve => setTimeout(resolve, ms)),
    sleepThenFail: (ms, msg) => new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), ms)),
    print: msg => console.log(msg)
});





slownode.eval(`
    print('starting...');
    sleep(1000);
    print('after one second...');
    sleepThenFail(1000, 'oops!');
    throw 42;
    print('...finished');
`);





slownode.on('error', (err, scriptId) => {
    console.log(`Error evaluating script '${scriptId}':`);
    console.log(err);
});
