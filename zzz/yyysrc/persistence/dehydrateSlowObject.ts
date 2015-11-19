import assert = require('assert');
import _ = require('lodash');
import SlowKind = require('../slowKind');
import SlowObject = require('../slowObject');
import isRelocatableFunction = require('../util/isRelocatableFunction');
export = dehydrateSlowObject;


/**
 * Recursively converts the given slow object into an object that can be safely converted to JSON.
 * Throws an error if any part of the value cannot be converted.
 */
function dehydrateSlowObject(slowObj: SlowObject, allSlowObjs: Set<SlowObject>, weakRefs: WeakSet<Object>) {

    // TODO: temp testing...
    if (!allSlowObjs.has(slowObj)) {
        // Should never get here. This matches the assertion below, but allows debugging. Remove this when solid.
        debugger;
    }

    assert(allSlowObjs.has(slowObj));
    return _.mapValues(slowObj.$slow, v => dehydrate(v, allSlowObjs, weakRefs));
}


/**
 * Recursively converts the given value into an object that can be safely converted to JSON.
 * Throws an error if any part of the value cannot be converted.
 */
function dehydrate(value: any, allSlowObjs: Set<SlowObject>, weakRefs: WeakSet<Object>) {

    // Some primitives map to themselves. Return them as-is.
    if (_.isString(value) || _.isNumber(value) || _.isBoolean(value) || _.isNull(value)) {
        return value;
    }

    // Map a weak reference to null.
    else if (weakRefs.has(value)) {
        return null;
    }

    // Map a slow object reference to a shorthand $ref object
    else if (allSlowObjs.has(value)) {
        return { $ref: value.$slow.id };
    }

    // Map an array of values to an array of safe values.
    else if (_.isArray(value)) {
        return value.map(v => dehydrate(v, allSlowObjs, weakRefs));
    }

    // Map a plain (and non-slow) object to a new object whose property values are safe values.
    else if (_.isPlainObject(value)) {
        return { $type: 'object', value: _.pairs(value).map(pair => [pair[0], dehydrate(pair[1], allSlowObjs, weakRefs)]) };
    }

    // Map `undefined` to a sentinel object that will be deserialized back to `undefined`
    else if (_.isUndefined(value)) {
        return { $type: 'undefined' };
    }

    // Map a function to a json-safe form, but only if the function is relocatable.
    else if (_.isFunction(value)) {
        if (isRelocatableFunction(value)) return { $type: 'function', value: value.toString() };
        throw new Error(`dehydration not supported for non-relocatable function: ${value}`);
    }

    // Map a plain Error instance to a json-safe form.
    else if (value && value.constructor === Error) {
        return { $type: 'error', value: value.message };
    }

    // If we get to here, the value is not recognised. Throw an error.
    throw new Error(`dehydration not supported for value : ${value}`);
}
