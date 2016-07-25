// TODO: others:
// - Date
// - Error and all builtin subclasses (TypeError etc)
// - function (when safe - eg only pure functions, not closures. But complex to analyze...)
// - Map, Set, WeakMap, WeakSet (Weak* not possible?)
// - Promise (not possible)
// - String, Number, Boolean (i.e. boxed, perhaps with extra props)
// - generator-function (see function above)
// - generator (GenObj)
// - typed-array
// - array-buffer
// - reflect, proxy, getters & setters
// - class instances
// - subclassed builtins





import * as array from './array';
import * as infinity from './infinity';
import * as nan from './nan';
import * as negativeZero from './negative-zero';
import * as regexp from './regexp';
import * as undefd from './undefined';
import * as unsupported from './unsupported';
import compose from '../compose';
import Replacer from '../replacer';
import Reviver from '../reviver';





// Export all the builtin replacers.
export const replacers = {
    all: <Replacer> null,
    Array: array.replacer,
    Infinity: infinity.replacer,
    NaN: nan.replacer,
    negativeZero: negativeZero.replacer,
    RegExp: regexp.replacer,
    undefined: undefd.replacer,
    unsupported: unsupported.replacer
}





// Export all the builtin revivers.
export const revivers = {
    all: <Reviver> null,
    Array: array.reviver,
    Infinity: infinity.reviver,
    NaN: nan.reviver,
    negativeZero: negativeZero.reviver,
    RegExp: regexp.reviver,
    undefined: undefd.reviver,
    unsupported: unsupported.replacer
}





// Create the 'all' composites from all the other replacers/revivers.
const notAllOrUnsupported = key => key !== 'all' && key !== 'unsupported';
replacers.all = compose(...Object.keys(replacers).filter(notAllOrUnsupported).map(key => replacers[key]));
revivers.all = compose(...Object.keys(revivers).filter(notAllOrUnsupported).map(key => revivers[key]));
