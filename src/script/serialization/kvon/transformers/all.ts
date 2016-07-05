import * as infinity from './infinity';
import * as nan from './nan';
import * as negativeZero from './negative-zero';
import * as regexp from './regexp';
import * as undefd from './undefined';
// TODO: others:
// - promise
// - generator
// - generator-function
// - typed-array
// - array-buffer
// - String, Number, Boolean
// - reflect, proxy, getters & setters
// - all std error types
// - class instances
// - subclassed builtins
// - negative zero




// TODO: ...
const allTransformers = [
    infinity,
    nan,
    negativeZero,
    regexp,
    undefd
];





// TODO: ...
export function replacer(this: {}, key: string|number, val: {}) {
    let xformed = val;
    for (let i = 0; Object.is(val, xformed) && i < allTransformers.length; ++i) {
        xformed = allTransformers[i].replacer.call(this, key, val);
    }
    return xformed;
}





// TODO: ...
export function reviver(this: {}, key: string|number, val: {}) {
    let xformed = val;
    for (let i = 0; Object.is(val, xformed) && i < allTransformers.length; ++i) {
        xformed = allTransformers[i].reviver.call(this, key, val);
    }
    return xformed;
}
