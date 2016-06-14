'use strict';
import * as CircularJSON from 'circular-json';
import Replacer from './replacer';
import transform from './transform';
import * as tranformers from './transformers/all';





// TODO: fix signatures/pass-through...
export function stringify(value: any, replacer?: Replacer, space?) {

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
        // TODO: ...
        throw new Error(`Not implemented`);
    }

    let transformed = transform(value, compositeReplacer);
    let result = CircularJSON.stringify(transformed, null, space);
    return result;
}





// TODO: fix signatures/pass-through...
let parse = CircularJSON.parse;
