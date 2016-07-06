




// TODO: ... NB: Serializable excludes array...
export type Primitive = null|string|number|boolean;
export type PlainObject = Object;
export type Serializable = Primitive | {[key: string]: Serializable};
export type Escaped = {$type: 'esc', raw: {}};
//export type Reference = {$type: 'ref', path: string};
//export type EncodedArray = {$type: 'array', props: {}};





// TODO: doc... NB will return false for new String, new Number, etc
export function isPrimitive(x: any): x is Primitive {
    if (x === null) return true;
    let t = typeof x;
    return t === 'string' || t === 'number' || t === 'boolean';
}





// TODO: doc... NB will return false for arrays and 'subclassed' Object instances
export function isPlainObject(x: any): x is PlainObject {
    return x && Object.getPrototypeOf(x) === Object.prototype;
}





// TODO: ...
export function isEscaped(x: any): x is Escaped {
    return isPlainObject(x) && x.$type === 'esc';
}





// // TODO: remove this!! should be unused...
// export function isReference(x: any): x is Reference {
//     return isPlainObject(x) && x.$type === 'ref';
// }





// // TODO: remove this!! should be unused...
// export function isEncodedArray(x: any): x is EncodedArray {
//     return isPlainObject(x) && x.$type === 'array';
// }
