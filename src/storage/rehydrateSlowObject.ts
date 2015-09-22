import assert = require('assert');
import _ = require('lodash');
import SlowType = require('../slowType');
import SlowObject = require('../slowObject');
export = rehydrateSlowObject;


// TODO: temp testing...
type SlowObjectFactories = { [type: number]: ($slow: { type: SlowType, id?: string }) => SlowObject; };


/**
 * Recursively converts the given dehydrated slow object back to a normal slow object.
 * Throws an error if any part of the value cannot be converted.
 */
function rehydrateSlowObject(dehydrated: SlowObject, allSlowObjects: {[id: string]: SlowObject}, factories: SlowObjectFactories): SlowObject {

    // Rehydrate all the constituent parts in-place.
    var $slow = dehydrated.$slow;
    _.mapValues(dehydrated.$slow, (val, key, obj) => rehydrateInPlace(val, key, obj, allSlowObjects));

    // Rehydrate the slow object using the appropriate factory function.
    var factory = factories[$slow.type];
    assert(factory);
    var rehydratedSlowObject = factory($slow);
    return rehydratedSlowObject;
}


/**
 * Recursively converts the given json-safe value back to a normal value.
 * Throws an error if any part of the value cannot be converted.
 */
function rehydrateInPlace(val: any, key: any, obj: any, allSlowObjects: {[id: string]: SlowObject}) {

    // Some primitives map to themselves. Return them as-is.
    if (_.isString(val) || _.isNumber(val) || _.isBoolean(val) || _.isNull(val)) {
        // No-op.
    }

    // Map a shorthand $ref object to getter returning the slow object it references
    else if (val && val.$ref) {
        var $ref = val.$ref;
        Object.defineProperty(obj, key, { get: () => allSlowObjects[$ref], configurable: true, enumerable: true });
    }

    // Map an array of JSON-safe values to an array of rehydrated values.
    else if (_.isArray(val)) {
        val.forEach((elem, index) => rehydrateInPlace(elem, index, val, allSlowObjects));
    }

    // Map a plain (and non-special) object to an equivalent object whose property values have been rehydrated.
    else if (val && val.$type === 'object') {
        var pairs: [string, any][] = val.value;
        val = obj[key] = _.zipObject(pairs);
        _.forEach(val, (propValue, propName) => rehydrateInPlace(propValue, propName, val, allSlowObjects));
    }

    // Map the sentinel value for `undefined` back to `undefined`.
    else if (val && val.$type === 'undefined') {
        obj[key] = void 0;
    }

    // Map a json-safe 'function' back to an actual (relocatable) function.
    else if (val && val.$type === 'function') {
        obj[key] = eval('(' + val.value + ')');
    }

    // Map a json-safe 'error' back to a plain Error instance.
    else if (val && val.$type === 'error') {
        obj[key] = new Error(val.value);
    }

    // If we get to here, the value is not recognised. Throw an error.
    else {
        throw new Error(`rehydration not supported for value: ${val}`);
    }
}
