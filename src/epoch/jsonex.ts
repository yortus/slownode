// TODO: hat-tip to resurrect.js and blog... add links here...
// TODO: this is a pure util - move to a util folder or separate module
'use strict';





// TODO: ...
export function stringify(value: any, replacer?: ReplacerReviver, space?: string|number) {
    switch (typeof value) {
        case 'undefined':
        case 'string':
        case 'number':
        case 'boolean':
        case 'symbol':
        case 'function':
        case 'object': /* includes null and arrays */
        default: /* else host-defined object, ever get here with V8? */
    }



    if (value === null) {
        // TODO: ...
    }
    if (typeof value === 'string') {
        // TODO: ...
    }
    else if (typeof value === 'number') {
        // TODO: ...
    }
    else if (typeof value === 'boolean') {
        // TODO: ...
    }
    else if (Array.isArray(value)) { // TODO: weird arrays? subclasses, added props, holey...?
        // TODO: ...
    }
    else if (typeof value === 'object') {
        // TODO: ...
    }
    else {
        // TODO: what values would we get here? any?
    }
}





// TODO: ...
export function parse(text: string, reviver?: ReplacerReviver) {
    // TODO: ...
}





// TODO: ...
export type ReplacerReviver = (this: Object, key: string|number, value: any) => any;





// TODO: ...
export function encode(value: any, buffer: any[]): number {

    // TODO: ...
    let index = buffer.indexOf(value);
    if (index !== -1) return index;

    // TODO: ...
    if (value === null || ['string', 'number', 'boolean'].indexOf(value) !== -1) {
        index = buffer.length;
        buffer.push(value);
        return index;
    }

    // TODO: ...
    if (Array.isArray(value)) {
        
    }



}
