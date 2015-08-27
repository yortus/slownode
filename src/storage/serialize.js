var _ = require('lodash');
/**
 * Serializes the given value to a string suitable for text-based storage and transport.
 * Throws an error if the value cannot be serialized.
 */
function serialize(value) {
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
function toJSONSafeObject(value, treatSlowObjectsAsRefs) {
    if (treatSlowObjectsAsRefs === void 0) { treatSlowObjectsAsRefs = false; }
    // Some primitives are already safe. Return them unchanged.
    if (_.isString(value) || _.isNumber(value) || _.isBoolean(value) || _.isNull(value)) {
        return value;
    }
    else if (_.isArray(value)) {
        return value.map(function (elem) { return toJSONSafeObject(elem, treatSlowObjectsAsRefs); });
    }
    else if (_.isPlainObject(value) && !_.has(value, '_slow')) {
        return _.mapValues(value, function (propValue) { return toJSONSafeObject(propValue, treatSlowObjectsAsRefs); });
    }
    else if (_.isUndefined(value)) {
        return { $type: 'undefined' };
    }
    else if (_.isObject(value) && _.has(value, '_slow')) {
        if (treatSlowObjectsAsRefs) {
            return {
                $type: 'SlowRef',
                value: _.pick(value._slow, ['type', 'id'])
            };
        }
        else {
            return {
                $type: 'SlowDef',
                value: _.mapValues(value._slow, function (propValue) { return toJSONSafeObject(propValue, true); })
            };
        }
    }
    else {
        return { $type: 'ERROR - UNKNOWN?!' };
    }
    // If we get to here, the value is not recognised. Throw an error.
    throw new Error("toJSONSafeObject: value cannot be serialized: " + value);
}
module.exports = serialize;
//# sourceMappingURL=serialize.js.map