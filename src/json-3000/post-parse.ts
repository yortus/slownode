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

//     // TODO: ... all canonicals not available, so backpatch all references to them
//     // TODO: could memoize repeated calculations in here...
//     pathReferences.forEach(ref => {
//         // TODO: unsafe!!! original props names may have contained '.', in that case this split will fail
//         // TODO: paths sound be arrays of strings, like they are in falcor
//         let path = ref.path === '' ? [] : ref.path.split('.');
// debugger;
//         for (let tgt = value, i = 0; i < path.length; ++i) {
//             tgt = ref.obj[ref.key] = tgt[path[i]];
//         }
//     });


    // TODO: backpatch refs to defs
    pathRefs.forEach(ref => {
        let def = pathDefs.get(ref.path);
        ref.obj[ref.key] = def;
    });

// value['defs'] = pathDefs;
// value['refs'] = pathRefs;
console.log((<any>value).ENV.node);
console.log((<any>value).ENV.node.name === (<any>value).ENV.node['n.a.m.e.']);
    return value;

    // TODO: ...
    function traverse(obj: Serializable, key: string, val: Serializable, path: string[]): void {

        // TODO: special case  {$type: 'ref', ...}...
        if (isReference(val)) {
            pathRefs.push({obj, key, path: val.path});
            return;
        }

        // TODO: special case  {$type: 'esc', ...}...
        if (isEscaped(val)) {
            // TODO: The escaped object was a POJO untouched by the replacer, so it won't be put through the reviver (but its props will)...
            obj[key] = val = val.raw;
            Object.keys(val).forEach(subkey => {
                let pathSegment = JSON.stringify(subkey).slice(1, -1).replace(/\./g, '\\u002e');
                traverse(val, subkey, val[subkey], path.concat(pathSegment));
            });
            pathDefs.set(path.join('.'), val);
            return;
        }

        // TODO: recursive case... go depth first through props...
        if (isSerializableObject(val)) {
            Object.keys(val).forEach(subkey => {
                let pathSegment = JSON.stringify(subkey).slice(1, -1).replace(/\./g, '\\u002e');
                traverse(val, subkey, val[subkey], path.concat(pathSegment));
            });
        }

        // TODO: finally top level...
        obj[key] = val = reviver.call(obj, key, val);
        pathDefs.set(path.join('.'), val);
    }
}
