// TODO: does this function need to handle toJSON? See https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#toJSON()_behavior
import encodePathSegment from './encode-path-segment';
import Replacer from './replacer';
import {Serializable, Escaped, Reference, isSerializablePrimitive, isSerializableObject} from './serializable-types';





// TODO: ...
// TODO: what about symbol-keyed props? either handle them, or throw when encountered...
export default function preStringify(value: {}, replacer: Replacer): Serializable {

    // TODO: ...
    let canonicalPaths = new Map<any, string[]>();
    return traverse({'':value}, '', value, []);

    // TODO: ...
    function traverse(obj: {}, key: string, val: {}, path: string[]): Serializable {

        // Check if we have already encoded this `val` instance into the output object graph. If so, return
        // a special 'ref' encoding referring to the canonical location in the graph of the object's encoding.
        // This ensures the output object graph retains object identities, and supports circular references.
        if (canonicalPaths.has(val)) return <Reference> {
            $type: 'ref',
            path: canonicalPaths.get(val).join('.')
        };

        // Run the value through the replacer function. Let's call the before and after values `oldVal` and `newVal`.
        let oldVal = val;
        let newVal: {} = replacer.call(obj, key, oldVal);

        // If we are serializing a primitive value, it simply encodes to itself. Primitive values retain
        // their identity even under duplication, so there is no need to record canonical paths for them.
        if (isSerializablePrimitive(newVal)) {
            return newVal;
        }

        // After replacement, the value *must* be serializable. We've already covered serializable primitives,
        // leaving just plain object and array instances. If the value is *not* either of these, then we have one
        // of two possible errors:
        // (a) an error in the replacer function. Replacer functions are contracted to either leave the value unchanged,
        //     or return a serializable equivalent. So if the replacer returned a modified value, which is not
        //     serializable, then we can blame the replacer function.
        // (b) a non-serializable input value. If the replacer left the input value unchanged, then the input value
        //     must be unserializable with no replacer case that deals with it. That's a problem with the input value.
        // TODO: relax this restriction? Could try to recurse until we have something serializable... But may loop to infinity...
        if (!isSerializableObject(newVal)) {
            if (oldVal !== newVal) throw new Error(`Replacer function returned a non-serializable value: ${newVal}`);
            throw new Error(`No known serialization available for value: ${oldVal}`);
        }

        // We definitely have a plain object or array, and one that we haven't encountered before. Record the current
        // path as the canonical path for this value, so any subsequent occurrences in the object graph will ref to it.
        canonicalPaths.set(val, path);

        // Create a serialized equivalent of the plain object/array in the output object graph. This involves
        // enumerating its own enumerable properties, and recursively traversing them to create the output object.
        // Note that arrays are given a special encoding so that holes and extra properties are preserved.
        // TODO: what about non-enum properties? Getters? etc? Such props, if present, may break the roundtrip guarantees...
        let result = {};
        Object.keys(newVal).forEach(key => {
            result[key] = traverse(newVal, key, newVal[key], path.concat(encodePathSegment(key)));
        });
        if (Array.isArray(newVal)) {
            result = {$type: 'array', props: result};
        }

        // Finally, we must consider the special case where the original object contains a property called '$type',
        // and the replacer didn't change it. '$type' is a special property key reserved for serialized encodings.
        // Replacers are allowed to return objects with a '$type' property, and we leave those unchanged. But if the
        // *original* value contains a '$type' property, then it must be 'escaped', otherwise under deserialization
        // it may be mistaken for a reviver discriminant and decoded incorrectly. We escape by wrapping the original
        // object in an envelope with a special '$type': 'esc' property to distinguish it to the deserializer.
        if (oldVal === newVal && oldVal.hasOwnProperty('$type')) {
            result = <Escaped> {$type: 'esc', raw: result};
        }

        return result;
    }
}
