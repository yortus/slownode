'use strict';
import Reviver from './reviver';





// TODO: ...
export default function postParse(value: Serializable, reviver: Reviver): any {

    // // TODO: ...
    // let result = traverse(<any>{'':value}, '', value);
    // return result;

    // // TODO: ...
    // function traverse(obj: Serializable, key: string|number, val: {}): any {


    //     // TODO: For serializable literals, return them as-is, and don't dedupe them...
    //     if (isNullLiteral(newVal) || isStringLiteral(newVal) || isNumberLiteral(newVal) || isBooleanLiteral(newVal)) {
    //         return newVal;
    //     }





    //     // TODO: ...
    //     let oldVal = val;
    //     let newVal: Serializable = reviver.call(obj, key, oldVal);




    //     // TODO: Else ensure plain object or array. If not, the replacer returned a non-serializable value.
    //     // TODO: relax this restriction? Could recurse until we have something serializable...
    //     if (!isPlainObject(newVal) && !isPlainArray(newVal)) {
    //         throw new Error(`Replacer function returned a non-serializable value`);
    //     }

    //     // TODO: dedupe subsequent occurances of this instance in the graph...
    //     visited.set(oldVal, {$type: 'ref', path: path.join('.')});

    //     // TODO: For plain objects and arrays, recursively traverse their own enumerable properties...
    //     let result = isPlainObject(newVal) ? {} : [];
    //     Object.keys(newVal).forEach(key => {
    //         result[key] = traverse(newVal, key, newVal[key], path.concat(key)); // NB: recurses here
    //     });

    //     // TODO: if original object was unchanged and contains a $type property, escape it
    //     if (oldVal === newVal && oldVal.hasOwnProperty('$type')) {
    //         result = <any> {$type: 'esc', raw: result};
    //     }

    //     return result;
    // }
}





// TODO: ...
export type NullLiteral = null;
export type StringLiteral = string;
export type NumberLiteral = number;
export type BooleanLiteral = boolean;
export interface PlainObject extends Object { }
export interface PlainArray extends Array<any> { }
export type Serializable = NullLiteral|StringLiteral|NumberLiteral|BooleanLiteral|PlainObject|PlainArray;





// TODO: ...
const gpo = Object.getPrototypeOf;
function isNullLiteral(x: any): x is NullLiteral { return x === null; }
function isStringLiteral(x: any): x is StringLiteral { return typeof x === 'string'; }
function isNumberLiteral(x: any): x is NumberLiteral { return typeof x === 'number'; }
function isBooleanLiteral(x: any): x is BooleanLiteral { return typeof x === 'boolean'; }
function isPlainObject(x: any): x is PlainObject { return x && gpo(x) === Object.prototype; }
function isPlainArray(x: any): x is PlainArray { return x && gpo(x) === Array.prototype; }
