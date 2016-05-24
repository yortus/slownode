'use strict';
import Epoch from './workflows/epoch';





let epoch = new Epoch({
    globalFactory: () => ({
        print: msg => console.log(msg),
        a: 1,
        b: 2
    })
});


let wf = epoch.add(`print(3 + 7)`);

wf
    .then(val => {
        console.log('SUCCESS!');
    })
    .catch(err => {
        console.log('FAILURE!');
        console.log(err);
    });

