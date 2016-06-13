// TODO: hat-tip to resurrect.js and blog...
// - https://github.com/skeeto/resurrect-js
// - http://nullprogram.com/blog/2013/03/28/
// TODO: this is a pure util - move to a util folder or separate module
'use strict';
import {isGlobal} from './global';





// TODO: document/enforce/error/implement the many corner cases. Above all avoid silent changes in revived objects.
// - arrays with holes / sparse arrays
// - builtins with added props (Number, String, Array, etc etc)
// - non-enumerable own props
// - symbol-keyed props
// - subclasses of builtins
// - deleted props





// TODO: ...
export function myReplacer(this: Object, key: string|number, value: any) {

}

function regExpReplacer(this: Object, key: string|number, value: RegExp): any {

    // If `value` is not a RegExp instance, return it unchanged.
    if (!value || Object.getPrototypeOf(value) !== RegExp.prototype) return value;

    // Return a JSON representation of the RegExp instance.
    return { type: 'RegExp', pattern: value.source, flags: value.flags, lastIndex: value.lastIndex };
}

function regExpReviver(this: Object, key: string|number, value: any): any {

    // If `value` is not a RegExp instance, return it unchanged.
    if (!value || Object.getPrototypeOf(value) !== RegExp.prototype) return value;

    // Return a JSON representation of the RegExp instance.
    return { type: 'RegExp', pattern: value.source, flags: value.flags, lastIndex: value.lastIndex };
}



// TODO: ...
export function stringify(value: any, replacer?: ReplacerReviver, space?: string|number) {

    // TODO: ...
    let buffer = [];
    let visited = new Map<any, number>();

    // TODO: ...
    encode(value);
    let y = JSON.stringify(buffer, null, 4);
    return y;

    // TODO: ...
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
            let obj = { type: '', keys: [], vals: [] };
            buffer.push(obj);
            let ownKeys = Object.keys(value); // NB: own enumerable keys only
            obj.keys = ownKeys;
            obj.vals = ownKeys.map(key => encode(value[key]));

            if (Object.getPrototypeOf(value) === Object.prototype) {
                obj.type = 'pojo';
            }
            else if (isGlobal(value)) {
                obj.type = 'global';
            }
            else if (value instanceof Date) {
                obj.type = 'Date';
            }
            else if (value instanceof RegExp) {
                obj.type = 'RegExp';
            }
            else if (value instanceof Promise) {
                obj.type = 'Promise';
            }
            else {
                // TODO: temp testing...
                obj.type = `!!!don't know how to encode '${value}'`;
            }
        }

        // TODO: ... handle undefined...
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
