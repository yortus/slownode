var _ = require('lodash');
var Promise = require('bluebird');
/**
 * Serializes the given value to a string suitable for text-based storage and transport.
 * Throws an error if the value cannot be serialized.
 */
function deserialize(json) {
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
function unwrapJSONSafeObject(value) {
    // Some primitives need no unwrapping.
    if (_.isString(value) || _.isNumber(value) || _.isBoolean(value) || _.isNull(value)) {
        return value;
    }
    else if (_.isArray(value)) {
        return value.map(unwrapJSONSafeObject);
    }
    else if (_.isPlainObject(value) && !('$type' in value)) {
        return _.mapValues(value, unwrapJSONSafeObject);
    }
    else if (value && value.$type === 'undefined') {
        return void 0;
    }
    else if (value && value.$type === 'Promise') {
        return Promise.resolve(void 0);
    }
    // If we get to here, the value is not recognised. Throw an error.
    throw new Error("unwrapJSONSafeObject: value cannot be deserialized: " + value);
}
module.exports = deserialize;
//# sourceMappingURL=deserialize.js.map