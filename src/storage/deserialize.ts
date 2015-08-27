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
 * TODO: Recursively converts the given json-safe value back to a normal value.
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

    // Map a plain (and non-special) object to an equivalent object whose property values have been unwrapped.
    else if (_.isPlainObject(value) && !('$type' in value)) {
        return _.mapValues(value, unwrapJSONSafeObject);
    }

    // Map the sentinel value for `undefined` back to `undefined`.
    else if (value && value.$type === 'undefined') {
        return void 0;
    }

    // TODO: map a slow object reference...
    else if (value && value.$type === 'SlowRef') {
        // TODO: ...
        return null;
        throw 'Not implemented';
    }

    // TODO: map a slow object definition...
    else if (value && value.$type === 'SlowDef') {
        // TODO: ...
        return null;
        throw 'Not implemented';

        var slow: { type; id; } = _.mapValues(value.value, unwrapJSONSafeObject);

        //rehydrate

    }

    // If we get to here, the value is not recognised. Throw an error.
    throw new Error(`unwrapJSONSafeObject: value cannot be deserialized: ${value}`);
}
