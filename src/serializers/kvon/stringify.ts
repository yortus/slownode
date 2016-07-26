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

    /** Performs a single step of the recursive stringification process. */
    function recurse(obj: {}, key: string, val: {}, path: string[]): string {
        const specials = {'"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t'};
        let result: string;

        // Force variable narrowing inside closure. These are definitely narrowed after the normalizeX() calls above.
        replacer = <Replacer> replacer;
        space = <string> space;

        // We must preserve the identities of values that are encountered multiple times in the object graph being
        // stringified. This is trivial for primitive values, since two primitives with the same value have the same
        // identity. But for objects and arrays, we must keep track of multiple occurences in the object graph. The
        // `visited` map associates each value encountered with the special 'reference' string that indicates the path
        // into the object graph where it's singleton definition can be found. If `visited` maps a value to the
        // 'INCOMPLETE' sentinel, then the value has been visited before but has not been fully stringified yet, and
        // therefore must cyclically reference itself. This is not permitted in KVON, and we throw an error in that
        // case. Otherwise if the `visited` map holds a 'reference' string for the given value, then we return early
        // with that string.
        if (visited.has(val)) {
            result = visited.get(val);
            if (result !== INCOMPLETE) return result;
            throw new Error(`(KVON) cyclic object graphs are not supported`);
        }

        // Run `value` through the `replacer`. Detect whether the original value was replaced or left unchanged.
        let replacement: {} = replacer.call(obj, key, val);
        let isReplaced = !Object.is(val, replacement);

        // If the value *was* replaced, then the replacement *must* be a discriminated plain object (DPO). Verify this.
        if (isReplaced && !(isPlainObject(replacement) && replacement.hasOwnProperty('$'))) {
            throw new Error(`(KVON) replacement value must be a discriminated plain object`);
        }

        // Stringify the replacement value according to it's type.
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

            // For strings, escape all characters on the `special` list. Also, escape '^' if it appears as the first
            // character in the string, since that marks a string as a special `reference` value. By escaping it during
            // stringification, KVON#parse will later be able to distinguish the 'reference' strings from other strings.
            result = [...replacement].map(c => specials[c] || c).join('');
            result = '"' + result.replace(/^\^/g, '\\u005e') + '"';
        }
        else if (isPlainObject(replacement) || isPlainArray(replacement)) {

            // Plain objects and arrays are handled together here since many steps are the same.
            let isArray = Array.isArray(replacement);

            // Map this value to the special 'INCOMPLETE' marker in the `visited` map for now. This will be updated to
            // the appropriate 'reference' string when the value has been completely stringified. This way, if we come
            // across the 'INCOMPLETE' value again while recursing, we know the value must cyclically reference itself.
            visited.set(val, INCOMPLETE);

            // Stringify the entire object/array.
            result = isArray ? '[' : '{';
            for (let keys = Object.keys(replacement), len = keys.length, i = 0; i < len; ++i) {

                // Get stringified forms for the element/pair. This step is recursive. When we come across a '$' key,
                // then we must stringify it such that the KVON#parse step can distinguish between (A) an ordinary plain
                // object that wasn't replaced and just happens to have a '$' key, and (B) a replacement DPO where the
                // '$' key represents the discriminant needed later by KVON#parse revival. We distinguish the two cases
                // by escaping '$' keys in POJOs that weren't replaced, and leaving them intact in DPOs.
                let subkey = keys[i];
                let keyText = JSON.stringify(subkey);
                if (!isReplaced && keyText === '"$"') keyText = '"\\u0024"';
                let valText = recurse(replacement, subkey, replacement[subkey], path.concat(subkey));

                // Stringify the element/pair as a whole, including punctuation and whitespace as necessary.
                if (i > 0) result += ',';
                if (space) result += '\n' + space.repeat(path.length + 1);
                result += isArray ? valText : `${keyText}:${space ? ' ' : ''}${valText}`;
                if (space && i === len - 1) result += '\n' + space.repeat(path.length);
            }
            result += isArray ? ']' : '}';

            // The value has been completely stringified, so we can update `visited` now.
            visited.set(val, makeReference(path));
        }

        // We ensured earlier that the replacer either returned a DPO or left the value unchanged. Therefore if we reach
        // here, the replacer must have left the value unchanged, and the value itself is not serializable.
        else {
            throw new Error(`(KVON) no known serialization available for value: ${val}`);
        }

        // Return the stringified value.
        return result;
    }
}



// TODO: ...
function normalizeSpace(space: string | number): string {
    space = space || '';
    if (typeof space === 'number') space = ' '.repeat(Math.max(0, Math.min(10, space)));
    if (space && typeof space !== 'string') throw new Error("(KVON) expected `space` to be a string or number");
    if (!/^[\s\t\n\r]*$/g.test(space)) throw new Error("(KVON) `space` string must contain only whitespace characters");
    if (!space || typeof space === 'string') return (space || '').slice(0, 10);
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
