import _ = require('lodash');
export = serialize;


/**
 * Serializes the given value to a string suitable for text-based storage and transport.
 * Throws an error if the value cannot be serialized.
 */
function serialize(value: any) {
    try {
        var jsonSafeObject = toJSONSafeObject(value);
        var json = JSON.stringify(jsonSafeObject);
        return json;
    }
    catch (ex) {
        // TODO: what to do? just rethrow for now...
        throw ex;
    }
}


/**
 * Recursively converts the given value into an object that can be safely converted to JSON.
 * Throws an error if any part of the value cannot be converted.
 */
function toJSONSafeObject(value: any) {

    // Some primitives are already safe. Return them unchanged.
    if (_.isString(value) || _.isNumber(value) || _.isBoolean(value) || _.isNull(value)) {
        return value;
    }

    // Map an array of values to an array of safe values.
    else if (_.isArray(value)) {
        return value.map(toJSONSafeObject);
    }

    // Map a plain object to a new object whose property values are safe values.
    else if (_.isPlainObject(value)) {
        return _.mapValues(value, toJSONSafeObject);
    }

    // Undefined
    else if (_.isUndefined(value)) {
        return { $type: 'undefined' };
    }

    // TODO: temp testing...
    else if (value && typeof value.then === 'function') {
        return { $type: 'Promise', value: 'blah' };
    }

    // TODO: temp testing... just for SlowPromise testing then remove!!!
    else {
        return { $type: 'unknown' };
    }

    // If we get to here, the value is not recognised. Throw an error.
    throw new Error(`toJSONSafeObject: value cannot be serialized: ${value}`);
}
