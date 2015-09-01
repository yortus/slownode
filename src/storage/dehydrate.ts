import _ = require('lodash');
import isRelocatableFunction = require('../functions/isRelocatableFunction');
export = dehydrate;


/**
 * Recursively converts the given value into an object that can be safely converted to JSON.
 * Throws an error if any part of the value cannot be converted.
 */
function dehydrate(value: any) {

    // Some primitives map to themselves. Return them as-is.
    if (_.isString(value) || _.isNumber(value) || _.isBoolean(value) || _.isNull(value)) {
        return value;
    }

    // TODO: Map a slow object reference...
    else if (_.isObject(value) && _.has(value, '_slow')) {
        return { $ref: value._slow.id };
    }

    // Map an array of values to an array of safe values.
    else if (_.isArray(value)) {
        return value.map(dehydrate);
    }

    // Map a plain (and non-slow) object to a new object whose property values are safe values.
    // TODO: use a $type here to avoid rehydration ambiguities (eg what if this object has a $type key?
    else if (_.isPlainObject(value) && !_.has(value, '_slow')) {
        return { $type: 'object', value: _.mapValues(value, dehydrate) };
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
