import * as regexp from './regexp';
import * as undefd from './undefined';
// TODO: others:
// - global (and all its std props)
// - generator
// - generator-function
// - typed-array
// - array-buffer
// - String, Number, Boolean
// - reflect, proxy, getters & setters
// - all std error types
// - class instances
// - subclassed builtins




// TODO: ...
const allTransformers = [regexp, undefd];





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
