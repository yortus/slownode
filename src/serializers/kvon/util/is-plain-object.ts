




/**
 * Detects whether the given value is a plain object suitable for simple KVON serialization.
 * Performs a range of checks aimed at ensuring that, given plain objects P1 and P2 such that
 * P2 := parse(stringify(P1)), then P1 and P2 are functionally indistinguishable. A notable
 * exception to this is if P1 is an ES6 proxy, since there is no way to detect a proxy object.
 */
export default function isPlainObject(x: any): x is Object {
    if (!x || Object.getPrototypeOf(x) !== Object.prototype) return false;
    if (Object.getOwnPropertySymbols(x).length > 0) return false;
    let keys = Object.getOwnPropertyNames(x);
    for (let i = 0; i < keys.length; ++i) {
        let d = Object.getOwnPropertyDescriptor(x, keys[i]);
        if (!d.enumerable || !d.configurable || !d.writable) return false;
        if (d.get || d.set) return false;
    }
    return true;
}
