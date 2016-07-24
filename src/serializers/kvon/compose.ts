import Replacer from './replacer';
import Reviver from './reviver';





// TODO: ...
export default function compose(...replacers: Replacer[]): Replacer;
export default function compose(...revivers: Reviver[]): Reviver;
export default function compose(...transformers: Array<(this: {}, key: string, val: {}) => any>) {
    return function composed(this: {}, key: string, val: {}) {
        let transformed = val;
        for (let i = 0; Object.is(val, transformed) && i < transformers.length; ++i) {
            transformed = transformers[i].call(this, key, val);
        }
        return transformed;
    }
}
