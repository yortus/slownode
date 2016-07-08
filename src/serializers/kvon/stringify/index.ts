import Map from '../wtf-map';
import Replacer from './replacer';
import {Serializable, isPrimitive, isPlainObject, isPlainArray} from '../serializable-types';
import * as tranformers from '../transformers/all'; // TODO: bring local...





// TODO: ...
export {Replacer};





// TODO: ...
export default function stringify(value: any, replacer?: Replacer, space?: string|number): string {

    // TODO: ...
    let compositeReplacer: Replacer;
    if (!replacer) {
        compositeReplacer = tranformers.replacer;
    }
    else if (typeof replacer === 'function') {
        compositeReplacer = function (this, key, val) {
            let newVal = replacer.call(this, key, val);
            if (Object.is(val, newVal)) newVal = tranformers.replacer.call(this, key, val);
            return newVal;
        }
    }
    else {
        // TODO: JSON replacer may also be an array of string|number... handle this case
        throw new Error(`Not implemented`);
    }

    // TODO: ...
    let visited = new Map<{}, string>();
    let result = test({'':value}, '', value, [], compositeReplacer, visited);
    return result;
}





// TODO: ...
// - top-down traverse
//   - escape reserved chars in object keys
//   - encode cross references
//   - run replacer
function test(obj: {}, key: string, val: {}, path: string[], replacer: Replacer, visited: Map<{}, string>): string {

    // TODO: explain...
    if (visited.has(val)) return visited.get(val);

    // Run the value through the replacer function. Detect whether the original value is replaced or left unchanged.
    // TODO: add sanity check to assert that the replacer didn't mutate `obj` or `val`?
    let replacement: {} = replacer.call(obj, key, val);
    let isUnchanged = Object.is(val, replacement);
    let result: string;

    // For a primitive value, no further traversal is necessary.
    // TODO: explain steps in here...
    if (isPrimitive(replacement)) {
        if (typeof replacement === 'string') replacement = escapeValueText(replacement);
        result = JSON.stringify(replacement);
        visited.set(val, result);
    }

    // TODO: explain... recurse!
    else if (isPlainObject(replacement)) {

        // TODO: ...
        visited.set(val, makeReferenceText(path));

        // TODO: ...
        // TODO: honour spacing...
        let props = Object.keys(replacement).map(subkey => {
            let keyText = JSON.stringify(isUnchanged ? escapeKeyText(subkey) : subkey);
            let valText = test(replacement, subkey, replacement[subkey], path.concat(subkey), replacer, visited);
            return `${keyText}:${valText}`;
        });
        result = `{${props.join(',')}}`;
    }

    // TODO: explain... recurse!
    else if (isPlainArray(replacement)) {

        // TODO: ...
        visited.set(val, makeReferenceText(path));

        // TODO: ...
        // TODO: honour spacing...
        let elements = replacement.map((element, index) => {
            let subkey = String(index);
            let valText = test(replacement, subkey, element, path.concat(subkey), replacer, visited);
            return valText;
        });
        result = `[${elements.join(',')}]`;
    }

    // If the replacement value is neither a primitive value nor a plain object, then we have a serialization error.
    // There are two possible causes for such an error:
    // (a) an error in the replacer function. Replacer functions are contracted to either leave the value unchanged,
    //     or otherwise to return a primitive value or plain object. So if the replacer returned a modified value
    //     which is not a primitive or plain object, then the problem lies in the replacer function.
    // (b) a non-serializable input value. If the replacer left the input value unchanged, then the input value
    //     must be unserializable with no replacer case that deals with it. That's a problem with the input value.
    else {
        if (isUnchanged) throw new Error(`No known serialization available for value: ${val}`);
        throw new Error(`Replacer function returned a non-serializable value: ${replacement}`);
    }

    // Return the replacement value.
    return result;
}





// TODO: ...
function escapeKeyText(key: string) {
    return key === '$' ? '\\u0024' : key;
}





// TODO: ...
function escapeValueText(value: string) {
    return value.replace(/^\^/g, '\\u005e');
}





// TODO: ...
function makeReferenceText(path: string[]): string {
    let safePath = path.map(seg => JSON.stringify(seg).slice(1, -1).replace(/\./g, '\\u002e'));
    return '"' + ['^'].concat(safePath).join('.') + '"';
}
