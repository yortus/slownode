import * as all from './all';
import * as array from './array';
import * as infinity from './infinity';
import * as nan from './nan';
import * as negativeZero from './negative-zero';
import * as regexp from './regexp';
import * as undefd from './undefined';





// TODO: rename some of these... use standard names
export const replacers = {
    all: all.replacer,
    array: array.replacer,
    infinity: infinity.replacer,
    nan: nan.replacer,
    negativeZero: negativeZero.replacer,
    regexp: regexp.replacer,
    undefd: undefd.replacer
}





// TODO: rename some of these... use standard names
export const revivers = {
    all: all.reviver,
    array: array.reviver,
    infinity: infinity.reviver,
    nan: nan.reviver,
    negativeZero: negativeZero.reviver,
    regexp: regexp.reviver,
    undefd: undefd.reviver
}
