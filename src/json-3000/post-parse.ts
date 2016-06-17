import encodePathSegment from './encode-path-segment';
import Reviver from './reviver';
import {Serializable, isSerializableObject, isEscaped, isReference} from './serializable-types';





// TODO: ...
export default function postParse(value: Serializable, reviver: Reviver): any {

    // TODO: ...
    let pathDefs = new Map<string, any>();
    let pathRefs: Array<{obj: Serializable, key: string, path: string}> = [];

    // TODO: ...
    let envelope = {'':value};
    traverse(envelope, '', value, []);
    value = envelope[''];

    // TODO: backpatch refs to defs
    pathRefs.forEach(ref => {
        ref.obj[ref.key] = pathDefs.get(ref.path);
    });

    // TODO: ...
    return value;

    // TODO: ...
    function traverse(obj: Serializable, key: string, val: Serializable, path: string[]): void {

        // Check if `val` represents a reference to a canonical decoding elsewhere in the object graph. If so,
        // just record the details for backpatching after the full traversal has completed. Since there are no
        // guarantees with property enumeration order, it would be unsafe to resolve the reference now, because
        // the canonical path is refers to may not have been decoded yet.
        if (isReference(val)) {
            pathRefs.push({obj, key, path: val.path});
            return;
        }

        // If `val` is an object or array, then its properties are traversed (recursively) *before* `val` itself is
        // put through the reviver. This ensures revivers are called in the reverse order of replacers.
        if (isSerializableObject(val)) {

            // Check for the special case of an 'escaped' plain object. The serializer only produces these encodings for
            // plain objects that were untouched by all replacers, and which contain a '$type' property. Escaped objects
            // decode to their unescaped value, without revival. However, the object's properties are still traversed.
            if (isEscaped(val)) {
                obj[key] = val = val.raw;
                var noRevive = true;
            }

            // Traverse the properties of the object/array, so that they are recursively revived.
            Object.keys(val).forEach(subkey => {
                traverse(val, subkey, val[subkey], path.concat(encodePathSegment(subkey)));
            });
        }

        // Finally, run the reviver function on `val` itself (unless it was an escaped form). The revived value is
        // the canonical value corresponding to the current path, so we also record that mapping here. These
        // canonical mappings are used to resolve all the 'ref' references after traversal has completed.
        if (!noRevive) obj[key] = val = reviver.call(obj, key, val);
        pathDefs.set(path.join('.'), val);
    }
}
