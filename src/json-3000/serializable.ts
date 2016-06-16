




// TODO: ...
export default Serializable;
type Serializable = null|string|number|boolean|Object|Array<any>;





// TODO: doc... NB will return false for new String, new Number, etc
export function isSerializablePrimitive(x: any): x is null|string|number|boolean {
    if (x === null) return true;
    let t = typeof x;
    return t === 'string' || t === 'number' || t === 'boolean';
}





// TODO: doc... NB will return false for 'subclassed' Object and Array instances
export function isSerializableObject(x: any): x is Object|Array<any> {
    if (!x) return false;
    let proto = Object.getPrototypeOf(x);
    return proto === Object.prototype || proto === Array.prototype;
}
