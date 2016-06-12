// TODO: hat-tip to resurrect.js and blog...
// - https://github.com/skeeto/resurrect-js
// - http://nullprogram.com/blog/2013/03/28/
// TODO: this is a pure util - move to a util folder or separate module
'use strict';





// TODO: ...
export function stringify(value: any, replacer?: ReplacerReviver, space?: string|number) {
    // switch (typeof value) {
    //     case 'undefined':
    //     case 'string':
    //     case 'number':
    //     case 'boolean':
    //     case 'symbol':
    //     case 'function':
    //     case 'object': /* includes null and arrays */
    //         // TODO: weird arrays? subclasses, added props, holey...?
    //     default: /* else host-defined object, ever get here with V8? */
    // }

    let buffer = [];
    let visited = new Map<any, number>();


    encode(value);
    let y = JSON.stringify(buffer, null, 4);
    return y;




    function encode(value: {}): number {

        // TODO: Check/update 'visited'...
        if (visited.has(value)) return visited.get(value);
        visited.set(value, buffer.length);

        // TODO: ...
        if (value === null || ['string', 'number', 'boolean'].indexOf(typeof value) !== -1) {
            buffer.push(value);
        }

        // TODO: ...
        else if (Array.isArray(value)) {
            let ar = [];
            buffer.push(ar);
            for (let i = 0; i < value.length; ++i) {
                ar[i] = encode(value[i]);
            }
        }

        // TODO: ...
        else if (typeof value === 'object') {
            let obj = {};
            buffer.push(obj);
            let keys = Object.keys(value);
            for (let i = 0; i < keys.length; ++i) {
                obj[keys[i]] = encode(value[keys[i]]);
            }
        }

        // TODO: ...
        else {
            // TODO: temp testing...
            buffer.push(`!!!don't know how to encode '${value}'`);

            // TODO: was... throw new Error(`don't know how to encode '${value}'`);
        }

        // TODO: ...
        return visited.get(value);
    }
}





// TODO: ...
export function parse(text: string, reviver?: ReplacerReviver) {
    // TODO: ...
}





// TODO: ...
export type ReplacerReviver = (this: Object, key: string|number, value: any) => any;
