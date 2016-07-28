// TODO: others: (***AND*** ensure unit tests for each case implemented)
// - objects (incl arrays, funcs, dates, regexps, etc) with:
//   - symbol-keyed properties
//   - non-default property descriptors (eg not configurable or not writable)
//   - getters/setters (just fail on encountering these?)
// - Date
// - Error and all builtin subclasses (TypeError etc)
// - function (when safe - eg only pure functions, not closures. But complex to analyze...)
// - Map, Set, WeakMap, WeakSet (Weak* not possible?)
// - Promise (not possible? unles already resolved... but how to inspect? any node/V8 api for that?)
// - String, Number, Boolean (i.e. boxed, perhaps with extra props)
// - subclassed builtins
// - class instances
// - generator-function (see function above)
// - generator (GenObj)
// - typed-array
// - array-buffer
// - reflect
// - proxy (impossible to detect?)





import * as array from './array';
import * as infinity from './infinity';
import * as nan from './nan';
import * as negZero from './negative-zero';
import * as regexp from './regexp';
import * as undefd from './undefined';
import * as unsupd from './unsupported';
import compose from '../compose';
import Replacer from '../replacer';
import Reviver from '../reviver';





/** Built-in replacer functions. */
export namespace replacers {

    /** Combines all built-in replacers except `unsupported` into a single replacer. */
    export let all = <Replacer> null;

    /** Encodes arrays with holes and/or extra properties, whilst allowing ordinary arrays to pass through. */
    export let Array = array.replacer;

    /** Encodes the special values Infinity and -Infinity. */
    export let Infinity = infinity.replacer;

    /** Encodes the special value NaN. */
    export let NaN = nan.replacer;

    /** Encodes the special value -0. */
    export let negativeZero = negZero.replacer;

    /** Encodes RegExp instances. */
    export let RegExp = regexp.replacer;

    /** Encodes the special value `undefined`. */
    export let undefined = undefd.replacer;

    /** Throws on encountering values that are known to be non-encodable. */
    export let unsupported = unsupd.replacer;
}





/** Built-in reviver functions. */
export namespace revivers {

    /** Combines all built-in revivers except `unsupported` into a single reviver. */
    export let all = <Reviver> null;

    /** Decodes arrays with holes and/or extra properties, whilst allowing ordinary arrays to pass through. */
    export let Array = array.reviver;

    /** Decodes the special values Infinity and -Infinity */
    export let Infinity = infinity.reviver;

    /** Decodes the special value NaN. */
    export let NaN = nan.reviver;

    /** Decodes the special value -0. */
    export let negativeZero = negZero.reviver;

    /** Decodes RegExp instances. */
    export let RegExp = regexp.reviver;

    /** Decodes the special value `undefined`. */
    export let undefined = undefd.reviver;

    /** Throws on encountering values that are known to be non-decodable. */
    export let unsupported = unsupd.reviver;
}





// Create the 'all' composites by combining the other replacers/revivers.
const notAllOrUnsupported = key => key !== 'all' && key !== 'unsupported';
replacers.all = compose(...Object.keys(replacers).filter(notAllOrUnsupported).map(key => replacers[key]));
revivers.all = compose(...Object.keys(revivers).filter(notAllOrUnsupported).map(key => revivers[key]));
