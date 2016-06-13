'use strict';
import * as regexp from './regexp';





// TODO: ...
const allTransformers = [regexp];





// TODO: ...
export function replacer(this: {}, key: string|number, val: {}) {
    let xformed = val;
    for (let i = 0; xformed === val && i < allTransformers.length; ++i) {
        xformed = allTransformers[i].replacer.call(this, key, val);
    }
    return xformed;
}





// TODO: ...
export function reviver(this: {}, key: string|number, val: {}) {
    let xformed = val;
    for (let i = 0; xformed === val && i < allTransformers.length; ++i) {
        xformed = allTransformers[i].reviver.call(this, key, val);
    }
    return xformed;
}
