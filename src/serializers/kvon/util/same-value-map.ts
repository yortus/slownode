/**
 * A drop-in replacement for Map that uses the 'same-value' algorithm (Object.is) when comparing keys.
 * This differs from the standard Map, which uses 'same-value-zero' and treats 0 and -0 as the same key.
 * See also: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness
 */
export default class SameValueMap<K, V> implements Map<K, V> {

    clear() {
        this._map.clear();
    }

    delete(key: K) {
        return this._map.delete(encodeNegativeZero(key));
    }

    forEach(callbackfn: (value: V, index: K, map: Map<K, V>) => void, thisArg?: any): void {
        this._map.forEach((v, k, map) => callbackfn(v, decodeNegativeZero(k), this), thisArg);
    }

    get(key: K): V | undefined {
        return this._map.get(encodeNegativeZero(key));
    }

    has(key: K): boolean {
        return this._map.has(encodeNegativeZero(key));
    }

    set(key: K, value?: V) {
        return this._map.set(encodeNegativeZero(key), value), this;
    }

    get size() {
        return this._map.size;
    }

    [Symbol.iterator]() {
        return this.entries();
    }

    entries() {
        return (function* (map: Map<K, V>) {
            for (let [k, v] of map.entries()) yield <[K, V]> [decodeNegativeZero(k), v];
        })(this._map);
    }

    keys() {
        return (function* (map: Map<K, V>) {
            for (let k of map.keys()) yield <K> decodeNegativeZero(k);
        })(this._map);
    }

    values(): IterableIterator<V> {
        return this._map.values();
    }

    readonly [Symbol.toStringTag]: 'Map' = <any> 'SameValueMap';

    toString() {
        return this._map.toString();
    }

    private _map = new Map<K, V>();
}





// Internal helpers for working with negative zero.
const encodeNegativeZero = (x: any) => Object.is(x, -0) ? NEGATIVE_ZERO : x;
const decodeNegativeZero = (x: any) => x === NEGATIVE_ZERO ? -0 : x;
const NEGATIVE_ZERO = {toString: () => '-0'};
