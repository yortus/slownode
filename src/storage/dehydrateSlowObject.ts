import assert = require('assert');
import _ = require('lodash');
import types = require('types');
import isRelocatableFunction = require('../functions/isRelocatableFunction');
export = dehydrateSlowObject;


/**
 * Recursively converts the given slow object into an object that can be safely converted to JSON.
 * Throws an error if any part of the value cannot be converted.
 */
function dehydrateSlowObject(slowObject: types.SlowObject, allSlowObjects: Set<types.SlowObject>): types.SlowObject {
    assert(allSlowObjects.has(slowObject));
    return <any> { $slow: _.mapValues(slowObject.$slow, v => dehydrate(v, allSlowObjects)) };
}


/**
 * Recursively converts the given value into an object that can be safely converted to JSON.
 * Throws an error if any part of the value cannot be converted.
 */
function dehydrate(value: any, allSlowObjects: Set<types.SlowObject>) {

    // Some primitives map to themselves. Return them as-is.
    if (_.isString(value) || _.isNumber(value) || _.isBoolean(value) || _.isNull(value)) {
        return value;
    }

    // Map a slow object reference to a shorthand $ref object
    else if (allSlowObjects.has(value)) {
        return { $ref: value.$slow.id };
    }

    // Map an array of values to an array of safe values.
    else if (_.isArray(value)) {
        return value.map(v => dehydrate(v, allSlowObjects));
    }

    // Map a plain (and non-slow) object to a new object whose property values are safe values.
    else if (_.isPlainObject(value)) {
        return { $type: 'object', value: _.pairs(value).map(pair => [pair[0], dehydrate(pair[1], allSlowObjects)]) };
    }

    // Map `undefined` to a sentinel object that will be deserialized back to `undefined`
    else if (_.isUndefined(value)) {
        return { $type: 'undefined' };
    }

    // TODO: doc...
    else if (_.isFunction(value)) {
        if (isRelocatableFunction(value)) return { $type: 'function', value: value.toString() };
        throw new Error(`dehydration not supported for non-relocatable function: ${value}`);
    }

    // TODO: doc...
    else if (value && value.constructor === Error) {
        return { $type: 'error', value: value.message };
    }

    // TODO: temp testing... remove this...
    //else {
    //    return { $type: 'ERROR - UNKNOWN?!' };
    //}

    // If we get to here, the value is not recognised. Throw an error.
    throw new Error(`dehydration not supported for value : ${value}`);
}
