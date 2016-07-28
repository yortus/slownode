import compose from './compose';
import isPlainArray from './util/is-plain-array';
import isPlainObject from './util/is-plain-object';
import Map from './util/same-value-map';
import Replacer from './replacer';





/**
  * Checks whether a JavaScript value can be converted to a Key/Value Object Notation (KVON) string.
  * This is more optimal that using `stringify` with `try/catch` for value checking, because it doesn't
  * need to perform any actual stringification. However, it does need to call the `replacer` function(s)
  * in exactly the same places that `stringify` does. NB: this function does not directly throw any errors,
  * but rather returns `false` in cases where `stringify` would throw, including if `replacer` throws.
  * @param value A JavaScript value, usually an object graph, to be converted.
  * @param replacer A function that transforms the results, or an array of such functions.
 */
export default function canStringify(value: any, replacer?: Replacer | Replacer[], space?: string | number): boolean {

    // Validate and normalize arguments.
    replacer = normalizeReplacer(replacer);
    if (!replacer) return false;
    if (typeof space === 'string' && !/^[\s\t\n\r]*$/g.test(space)) return false;

    // Recursively check the entire object graph.
    let visited = new Map<{}, void>();
    return recurse({'':value}, '', value);

    /** Performs a single step of the recursive checking process. */
    function recurse(obj: {}, key: string, val: {}): boolean {

        // Check if we've come across this value elsewhere in the object graph. If we *have* already handled it, then
        // we can return early instead of repeating the same checks again. We also detect cyclic objects here, which
        // have been encountered before but haven't been completely checked, and hence map to the INCOMPLETE sentinel.
        if (visited.has(val)) {
            return visited.get(val) !== INCOMPLETE;
        }

        // Run `value` through the `replacer`. Detect whether the original value was replaced or left unchanged.
        let replacement: {};
        try {
            replacement = (<Replacer> replacer).call(obj, key, val);
        }
        catch (err) {
            return false;
        }
        let isReplaced = !Object.is(val, replacement);

        // If the value *was* replaced, then the replacement *must* be a discriminated plain object (DPO). Verify this.
        if (isReplaced && !(isPlainObject(replacement) && replacement.hasOwnProperty('$'))) {
            return false;
        }

        // Check all primitive values.
        if (replacement === null
            || typeof replacement === 'boolean'
            || (typeof replacement === 'number' && Number.isFinite(replacement) && !Object.is(replacement, -0))
            || typeof replacement === 'string') {
            return true;
        }

        // Check a plain object or array.
        if (isPlainObject(replacement) || isPlainArray(replacement)) {
            visited.set(val, INCOMPLETE);
            if (Object.keys(replacement).some(key => !recurse(replacement, key, replacement[key]))) return false;
            visited.set(val, null);
            return true;
        }

        // We ensured earlier that the replacer either returned a DPO or left the value unchanged. Therefore if we reach
        // here, the replacer must have left the value unchanged, and the value itself is not serializable.
        return false;
    }
}





/** Returns a `Replacer` function that is equivalent to the passed in `replacer`, which may have several formats. */
function normalizeReplacer(replacer: Replacer | Replacer[] | null): Replacer {
    if (!Array.isArray(replacer)) return replacer || NO_REPLACE;
    if (replacer.every(el => typeof el === 'function')) return compose(...replacer);
    return null;
}





/** A no-op replacer function. */
const NO_REPLACE = (key, val) => val;





/** The sentinel value used in the `visited` map to detect cyclic references. See comments elsewhere in this file. */
const INCOMPLETE = <any> {};
