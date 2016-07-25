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





import * as array from './array';
import * as infinity from './infinity';
import * as nan from './nan';
import * as negativeZero from './negative-zero';
import * as regexp from './regexp';
import * as undefd from './undefined';
import compose from '../compose';
import Replacer from '../replacer';
import Reviver from '../reviver';





// TODO: rename some of these... use standard names
export const replacers = {
    all: <Replacer> null,
    array: array.replacer,
    infinity: infinity.replacer,
    nan: nan.replacer,
    negativeZero: negativeZero.replacer,
    regexp: regexp.replacer,
    undefd: undefd.replacer
}





// TODO: rename some of these... use standard names
export const revivers = {
    all: <Reviver> null,
    array: array.reviver,
    infinity: infinity.reviver,
    nan: nan.reviver,
    negativeZero: negativeZero.reviver,
    regexp: regexp.reviver,
    undefd: undefd.reviver
}





// Create the 'all' composites from all the other replacers/revivers.
replacers.all = compose(...Object.keys(replacers).map(key => replacers[key]).filter(fn => !!fn));
revivers.all = compose(...Object.keys(revivers).map(key => revivers[key]).filter(fn => !!fn));
