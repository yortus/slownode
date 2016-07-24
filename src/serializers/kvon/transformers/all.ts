import compose from '../compose';

import * as array from './array';
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
export const replacer = compose(
    array.replacer,
    infinity.replacer,
    nan.replacer,
    negativeZero.replacer,
    regexp.replacer,
    undefd.replacer
);





// TODO: ...
export const reviver = compose(
    array.reviver,
    infinity.reviver,
    nan.reviver,
    negativeZero.reviver,
    regexp.reviver,
    undefd.reviver
);
