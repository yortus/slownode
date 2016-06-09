'use strict';





// TODO: ...
export default function createGlobal() {
    return {

        print: msg => console.log(msg),

        sleep: ms => new Promise(resolve => setTimeout(resolve, ms)),

        sleepThenFail: (ms, msg) => new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), ms)),

    };    
}





