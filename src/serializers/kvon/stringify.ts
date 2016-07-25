// TODO: support toJSON?
// TODO: support string|number arrays for replacer?
// TODO: support space (third arg)?


import compose from './compose';
import Map from './util/same-value-map';
import Replacer from './replacer';
import makeReference from './make-reference';





// TODO: ...
// TODO: replacer: accept replacer: (string|number)[]





/**
  * Converts a JavaScript value to a Key/Value Object Notation (KVON) string.
  * @param value A JavaScript value, usually an object graph, to be converted.
  * @param replacer A function that transforms the results, or an non-empty array of such functions.
  * @param space Adds indentation, white space, and line break characters to the return-value KVON text to make it easier to read.
  */
export default function stringify(value: any, replacer?: Replacer | Replacer[], space?: string|number): string;

/**
  * Converts a JavaScript value to a Key/Value Object Notation (KVON) string.
  * @param value A JavaScript value, usually an object graph, to be converted.
  * @param replacer An array of strings and numbers that acts as a whitelist for selecting the object properties that will be stringified.
  * @param space Adds indentation, white space, and line break characters to the return-value KVON text to make it easier to read.
  */
export default function stringify(value: any, replacer?: (number | string)[], space?: string|number): string;
export default function stringify(value: any, replacer?: Replacer | Replacer[] | (number | string)[], space?: string|number): string {
    replacer = normalizeReplacer(replacer);
    let visited = new Map<{}, string>();
    let result = test({'':value}, '', value, [], replacer, visited);
    return result;
}





// TODO: ...
function normalizeReplacer(replacer: Replacer | Replacer[] | (string|number)[]): Replacer {

    if (!replacer) {
        return NO_REPLACE;
    }
    if (Array.isArray(replacer)) {
        if (isReplacerArray(replacer)) return compose(...replacer);
        let whitelistedKeys = replacer.map(key => key.toString());

        // TODO: bug - don't retrict top-level object {'': val} - how to detect??
        return (key, val) => (isPlainObject(val) && whitelistedKeys.indexOf(key) === -1) ? void 0 : val;
    }
    else {
        return replacer;
    }
}
function isReplacerArray(x: any[]): x is Replacer[] {
    return x.length > 0 && x.every(el => typeof el === 'function');
}







// TODO: ...
// - top-down traverse
//   - escape reserved chars in object keys
//   - encode cross references
//   - run replacer
function test(obj: {}, key: string, val: {}, path: string[], replacer: Replacer, visited: Map<{}, string>): string {
    let result: string;

    // TODO: explain here, and document this limitation in README...
    if (visited.has(val)) {
        result = visited.get(val);
        if (result !== INCOMPLETE) return result;
        throw new Error(`(KVON) cyclic object graphs are not supported`);
    }

    // Run the value through the replacer function. Detect whether the original value is replaced or left unchanged.
    // TODO: add sanity check to assert that the replacer didn't mutate `obj` or `val`?
    let replacement: {} = replacer.call(obj, key, val);
    let isReplaced = !Object.is(val, replacement);

    // TODO: document the following rule in the README...
    // If the value was replaced, the replacement *must* be a discriminated plain object (DPO)
    if (isReplaced && !(isPlainObject(replacement) && replacement.hasOwnProperty('$'))) {
        throw new Error(`(KVON) replacement value must be a discriminated plain object`);
    }

    // For a primitive value, no further traversal is necessary.
    if (replacement === null) {
        result = 'null';
    }
    else if (typeof replacement === 'boolean') {
        result = replacement ? 'true' : 'false';
    }
    else if (typeof replacement === 'number') {
        result = replacement.toString();
    }
    else if (typeof replacement === 'string') {
        const specials = {'"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t'};
        result = [...replacement].map(c => specials[c] || c).join('');

        // TODO: escape strings that start with the special ^ character...
        result = '"' + result.replace(/^\^/g, '\\u005e') + '"';
    }

    // TODO: explain... recurse!
    else if (isPlainObject(replacement) || isPlainArray(replacement)) {
        let isArray = Array.isArray(replacement);

        // TODO: ...
        visited.set(val, INCOMPLETE);

        // TODO: ...
        // TODO: honour `space` param from stringify()...
        let items = Object.keys(replacement).map(subkey => {
            let keyText = JSON.stringify(subkey);
            if (!isReplaced && keyText === '"$"') keyText = '"\\u0024"'; // TODO: escape special '$' key
            let valText = test(replacement, subkey, replacement[subkey], path.concat(subkey), replacer, visited); // NB: recursive
            return isArray ? valText : `${keyText}:${valText}`;
        });
        result = `${isArray ? '[' : '{'}${items.join(',')}${isArray ? ']' : '}'}`;

        // TODO: ...
        visited.set(val, makeReference(path));
    }

    // If the replacement value is neither a primitive value nor a plain object, then we have a serialization error.
    // There are two possible causes for such an error:
    // (a) an error in the replacer function. Replacer functions are contracted to either leave the value unchanged,
    //     or otherwise to return a primitive value or plain object. So if the replacer returned a modified value
    //     which is not a primitive or plain object, then the problem lies in the replacer function.
    // (b) a non-serializable input value. If the replacer left the input value unchanged, then the input value
    //     must be unserializable with no replacer case that deals with it. That's a problem with the input value.
    else {
        if (!isReplaced) throw new Error(`(KVON) no known serialization available for value: ${val}`);
        throw new Error(`(KVON) replacer function returned a non-serializable value: ${replacement}`);
    }

    // TODO: ... only need to add non-primitives to map??
    if (!visited.has(val)) {
        visited.set(val, result);
    }

    // Return the replacement value.
    return result;
}





// TODO: ...
const NO_REPLACE = (key, val) => val;





// TODO: ...
const INCOMPLETE = <any> {};





// TODO: doc... NB will return false for arrays and 'subclassed' Object instances
function isPlainObject(x: any): x is PlainObject {
    return x && Object.getPrototypeOf(x) === Object.prototype;
}





// TODO: doc... NB will return false for arrays and 'subclassed' Object instances
function isPlainArray(x: any): x is PlainArray {
    return x && Object.getPrototypeOf(x) === Array.prototype;
}





// TODO: ...
type PlainObject = Object;
type PlainArray = Array<any>;
