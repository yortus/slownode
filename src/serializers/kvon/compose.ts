import Replacer from './replacer';
import Reviver from './reviver';





/**
 * Create a composite replacer that is equivalent to calling each of the given
 * replacers in sequence until one of them returns a modified (i.e. replaced)
 * value. If *none* of the constituent replacers returns a modified value,
 * then the composite replacer returns its value unmodified.
 */
export default function compose(...replacers: Replacer[]): Replacer;
/**
 * Create a composite reviver that is equivalent to calling each of the given
 * revivers in sequence until one of them returns a modified (i.e. revived)
 * value. If *none* of the constituent revivers returns a modified value,
 * then the composite reviver returns its value unmodified.
 */
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
