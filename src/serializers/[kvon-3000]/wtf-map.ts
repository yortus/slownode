




/** drop-in replacement for Map that treats 0 and -0 as distinct keys */
export default class WtfMap<K, V> implements Map<K, V> {

    clear() {
        this._map.clear();
    }

    delete(key: K) {
        return this._map.delete(wtf(key));
    }

    forEach(callbackfn: (value: V, index: K, map: Map<K, V>) => void, thisArg?: any): void {
        this._map.forEach((v, k, map) => callbackfn(v, unwtf(k), this), thisArg);
    }

    get(key: K): V | undefined {
        return this._map.get(wtf(key));
    }

    has(key: K): boolean {
        return this._map.has(wtf(key));
    }

    set(key: K, value?: V) {
        return this._map.set(wtf(key), value), this;
    }

    get size() {
        return this._map.size;
    }

    [Symbol.iterator]() {
        return this.entries();
    }

    entries() {
        return (function* (map: Map<K, V>) {
            for (let [k, v] of map.entries()) yield <[K, V]> [unwtf(k), v];
        })(this._map);
    }

    keys() {
        return (function* (map: Map<K, V>) {
            for (let k of map.keys()) yield <K> unwtf(k);
        })(this._map);
    }

    values(): IterableIterator<V> {
        return this._map.values();
    }

    readonly [Symbol.toStringTag]: 'Map' = <any> 'WtfMap';

    toString() {
        return this._map.toString();
    }

    private _map = new Map<K, V>();
}





const NEG_ZERO = {toString: () => '-0'};





function wtf(x: any) {
    return Object.is(x, -0) ? NEG_ZERO : x;
}





function unwtf(x: any) {
    return x === NEG_ZERO ? -0 : x;
}
