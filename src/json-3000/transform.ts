'use strict';
import Replacer from './replacer';





// TODO: ...
export default function transform(value: {}, replacer: Replacer): any {

    // TODO: ...
    let visited = new Map();
    let result = traverse({'':value}, '', value);
    return result;

    // TODO: ...
    function traverse(obj: {}, key: string|number, val: {}): Serializable {

if (val && val['type'] === 'Identifier') {
    debugger;
}

        // TODO: ...
        if (visited.has(val)) return visited.get(val);// TODO: was... new Reference(val);

        // TODO: ...
        let oldVal = val;
        let newVal: {} = replacer.call(obj, key, oldVal);
        visited.set(oldVal, newVal); // NB: may map to self if replacer did nothing

        // TODO: For serializable literals, return them as-is...
        if (isNullLiteral(newVal) || isStringLiteral(newVal) || isNumberLiteral(newVal) || isBooleanLiteral(newVal)) {
            return newVal;
        }

        // TODO: For plain objects and arrays, recursively traverse their own enumerable properties...
        else if (isPlainObject(newVal) || isPlainArray(newVal)) {



            let result = isPlainObject(newVal) ? {} : [];
            visited.set(oldVal, result);
            Object.keys(newVal).forEach(key => {
                result[key] = traverse(newVal, key, newVal[key]); // NB: recurses here
            });
            return result;
        }

        // TODO: Replacement value is not yet serializable - treat this as an error.
        // TODO: relax this restriction? Could recurse until we have something serializable...
        else if (oldVal !== newVal) {
            throw new Error(`Replacer function returned a non-serializable value`);
        }

        // TODO: replacer didn't change the value. What to do???
        else {
            return newVal; // TODO: temp testing... probably not the behaviour we want - will silently fail on revival
        }        
    }
}





// TODO: ...
type NullLiteral = null;
type StringLiteral = string;
type NumberLiteral = number;
type BooleanLiteral = boolean;
interface PlainObject extends Object { }
interface PlainArray extends Array<any> { }
class Reference { constructor(public key: any) { } }
type Serializable = NullLiteral|StringLiteral|NumberLiteral|BooleanLiteral|PlainObject|PlainArray|Reference;





// TODO: ...
const gpo = Object.getPrototypeOf;
function isNullLiteral(x: any): x is NullLiteral { return x === null; }
function isStringLiteral(x: any): x is StringLiteral { return typeof x === 'string'; }
function isNumberLiteral(x: any): x is NumberLiteral { return typeof x === 'number'; }
function isBooleanLiteral(x: any): x is BooleanLiteral { return typeof x === 'boolean'; }
function isPlainObject(x: any): x is PlainObject { return x && gpo(x) === Object.prototype; }
function isPlainArray(x: any): x is PlainArray { return x && gpo(x) === Array.prototype; }
function isReference(x: any): x is Reference { return x && gpo(x) === Reference.prototype; }
