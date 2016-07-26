import compose from './compose';
import Map from './util/same-value-map';
import Replacer from './replacer';
import makeReference from './make-reference';





/**
  * Converts a JavaScript value to a Key/Value Object Notation (KVON) string.
  * @param value A JavaScript value, usually an object graph, to be converted.
  * @param replacer A function that transforms the results, or an array of such functions.
  * @param space Adds indentation, white space, and line break characters to the returned KVON text for readability.
  */
export default function stringify(value: any, replacer?: Replacer | Replacer[], space?: string | number): string {
    replacer = normalizeReplacer(replacer);
    space = normalizeSpace(space);
    let visited = new Map<{}, string>();
    let result = recurse({'':value}, '', value, []);
    return result;


    // TODO: doc...
    function recurse(obj: {}, key: string, val: {}, path: string[]): string {
        replacer = <Replacer> replacer;
        space = <string> space;
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
            result = isArray ? '[' : '{';

            // TODO: ...
            for (let keys = Object.keys(replacement), len = keys.length, i = 0; i < len; ++i) {
                let subkey = keys[i];
                let keyText = JSON.stringify(subkey);
                if (!isReplaced && keyText === '"$"') keyText = '"\\u0024"'; // TODO: escape special '$' key
                let valText = recurse(replacement, subkey, replacement[subkey], path.concat(subkey)); // NB: recursive

                // Add comma between elements/pairs.
                if (i > 0) result += ',';

                // Add line break/indent before element/pair.
                if (space) result += '\n' + space.repeat(path.length + 1);

                // Add the stringified form of the element/pair.
                result += isArray ? valText : `${keyText}:${space ? ' ' : ''}${valText}`;

                // Add line break/indent before closing bracket/brace.
                if (space && i === len - 1) result += '\n' + space.repeat(path.length);
            }

            // TODO: ...
            result += isArray ? ']' : '}';


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







}



// TODO: ...
function normalizeSpace(space: string | number): string {
    if (typeof space === 'number') space = ' '.repeat(Math.max(0, Math.min(10, space)));
    if (!space || typeof space === 'string') return (space || '').slice(0, 10);
    throw new Error("(KVON) expected `space` to be a string or number");
}


// TODO: ...
// TODO: if space is a string, ensure it contains only whitespace characters: [\s\t\r\n] (better check? whole unicode category?)
function normalizeReplacer(replacer: Replacer | Replacer[]): Replacer {
    if (!Array.isArray(replacer)) return replacer || NO_REPLACE;
    if (replacer.every(el => typeof el === 'function')) return compose(...replacer);
    throw new Error(`(KVON) replacer must be a function or array of functions. Property whitelists are not supported`);
}












// TODO: ...
const NO_REPLACE = (key, val) => val;





// TODO: ...
const INCOMPLETE = <any> {};





// TODO: add more POJO checks - getters/setters, etc
function isPlainObject(x: any): x is PlainObject {
    return x && Object.getPrototypeOf(x) === Object.prototype;
}





// TODO: add more POJA checks - getters/setters, etc
function isPlainArray(x: any): x is PlainArray {
    if (!x || Object.getPrototypeOf(x) !== Array.prototype) return false;
    let keys = Object.keys(x);
    if (keys.length !== x.length) return false;
    return keys.every((k, i) => k === `${i}`);
}





// TODO: ...
type PlainObject = Object;
type PlainArray = Array<any>;
