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
        let def = pathDefs.get(ref.path);
        ref.obj[ref.key] = def;
    });

    // TODO: ...
    return value;

    // TODO: ...
    function traverse(obj: Serializable, key: string, val: Serializable, path: string[]): void {

        // TODO: special case  {$type: 'ref', ...}...
        if (isReference(val)) {
            pathRefs.push({obj, key, path: val.path});
            return;
        }

        let noRevive = false;

        // TODO: recursive case... go depth first through props...
        if (isSerializableObject(val)) {

            // TODO: The escaped object was a POJO untouched by the replacer, so it won't be put through the reviver (but its props will)...
            if (isEscaped(val)) {
                obj[key] = val = val.raw;
                noRevive = true;
            }

            // TODO: ...
            Object.keys(val).forEach(subkey => {
                let pathSegment = JSON.stringify(subkey).slice(1, -1).replace(/\./g, '\\u002e');
                traverse(val, subkey, val[subkey], path.concat(encodePathSegment(subkey)));
            });
        }

        // TODO: finally top level...
        if (!noRevive) {
            obj[key] = val = reviver.call(obj, key, val);
        }
        pathDefs.set(path.join('.'), val);
    }
}
