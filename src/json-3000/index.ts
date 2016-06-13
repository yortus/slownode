'use strict';
import * as CircularJSON from 'circular-json';
import * as tranformers from './transformers/all';





// TODO: fix signatures/pass-through...
export function stringify(value, replacer?, space?) {

    if (!replacer) {
        replacer = tranformers.replacer;
    }
    else if (typeof replacer === 'function') {
        const old = replacer;
        replacer = function (this, key, val) {
            let newVal = old.call(this, key, val);
            if (val === newVal) newVal = tranformers.replacer.call(this, key, val);
            return newVal;
        }
    }
    else {
        // TODO: ...
        throw new Error(`Not implemented`);
    }

    return CircularJSON.stringify(value, tranformers.replacer, space);
}





// TODO: fix signatures/pass-through...
let parse = CircularJSON.parse;
