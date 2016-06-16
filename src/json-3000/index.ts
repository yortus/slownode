// TODO: doc JSON3000 (in README?)
// - strictness - ie no silent roundtrip failures - parse(stringify(x)) must result in something that is observably identical to x, otherwise stringify/parse must throw
// - replacers - must either leave value unchanged or return a 'serializable' value
// - replacers - may return a plain object with the special discriminant prop '$type', but may *not* use $type:'ref' or $type:'esc'
import Replacer from './replacer';
import Reviver from './reviver';
import preStringify from './pre-stringify';
import postParse from './post-parse';
import * as tranformers from './transformers/all';





// TODO: fix signatures/pass-through...
export function stringify(value: any, replacer?: Replacer, space?: string|number) {

    let compositeReplacer: Replacer;
    if (!replacer) {
        compositeReplacer = tranformers.replacer;
    }
    else if (typeof replacer === 'function') {
        compositeReplacer = function (this, key, val) {
            let newVal = replacer.call(this, key, val);
            if (val === newVal) newVal = tranformers.replacer.call(this, key, val);
            return newVal;
        }
    }
    else {
        // TODO: JSON replacer may also be an array of string|number...
        throw new Error(`Not implemented`);
    }

    let transformed = preStringify(value, compositeReplacer);
    let result = JSON.stringify(transformed, null, space);
    return result;
}





// TODO: fix signatures/pass-through...
export function parse(text: string, reviver?: Reviver) {

    let compositeReviver: Reviver;
    if (!reviver) {
        compositeReviver = tranformers.reviver;
    }
    else if (typeof reviver === 'function') {
        compositeReviver = function (this, key, val) {
            // TODO: swap call order below? which order is correct/consistent? examples?
            let newVal = reviver.call(this, key, val);
            if (val === newVal) newVal = tranformers.reviver.call(this, key, val);
            return newVal;
        }
    }
    else {
        // TODO: JSON reviver may *only* be a function, so this error is correct (but needs finalizing)
        throw new Error(`Bad arg`);
    }


    let value = JSON.parse(text);
    let result = postParse(value, compositeReviver);
    return result;
}
