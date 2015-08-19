import _ = require('lodash');
import Promise = require('bluebird');
export = deserialize;


/**
 * Serializes the given value to a string suitable for text-based storage and transport.
 * Throws an error if the value cannot be serialized.
 */
function deserialize(json: string) {
    try {
        var jsonSafeObject = JSON.parse(json);
        var result = unwrapJSONSafeObject(jsonSafeObject);
        return result;
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
function unwrapJSONSafeObject(value: any) {

    // Some primitives need no unwrapping.
    if (_.isString(value) || _.isNumber(value) || _.isBoolean(value) || _.isNull(value)) {
        return value;
    }

    // Map an array of safe values to an array of unwrapped values.
    else if (_.isArray(value)) {
        return value.map(unwrapJSONSafeObject);
    }

    // Map a plain object to an equivalent object whose property values have been unwrapped.
    else if (_.isPlainObject(value) && !('$type' in value)) {
        return _.mapValues(value, unwrapJSONSafeObject);
    }

    // Undefined
    else if (value && value.$type === 'undefined') {
        return void 0;
    }

    // TODO: temp testing...
    else if (value && value.$type === 'Promise') {
        return Promise.resolve(void 0);
        // TODO: was... return Promise.reject(new Error(`Can't serialize/deserialize promises yet!`));
    }

    // If we get to here, the value is not recognised. Throw an error.
    throw new Error(`unwrapJSONSafeObject: value cannot be deserialized: ${value}`);
}
