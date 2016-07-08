




// TODO: ... NB: explain shortcoming of Serializable type as defd here - props/elements should also be serializable but TS can't express recursive type (yet?)...
export type Serializable = Primitive | PlainObject | (PlainArray);
export type Primitive = null|string|number|boolean;
export type PlainObject = Object;
export type PlainArray = Array<any>;





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





// TODO: doc... NB will return false for arrays and 'subclassed' Object instances
export function isPlainArray(x: any): x is PlainArray {
    return x && Object.getPrototypeOf(x) === Array.prototype;
}
