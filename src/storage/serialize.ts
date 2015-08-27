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
function toJSONSafeObject(value: any, treatSlowObjectsAsRefs = false) {

    // Some primitives are already safe. Return them unchanged.
    if (_.isString(value) || _.isNumber(value) || _.isBoolean(value) || _.isNull(value)) {
        return value;
    }

    // Map an array of values to an array of safe values.
    else if (_.isArray(value)) {
        return value.map(elem => toJSONSafeObject(elem, treatSlowObjectsAsRefs));
    }

    // Map a plain (and non-slow) object to a new object whose property values are safe values.
    else if (_.isPlainObject(value) && !_.has(value, '_slow')) {
        return _.mapValues(value, propValue => toJSONSafeObject(propValue, treatSlowObjectsAsRefs));
    }

    // Map `undefined` to a sentinel object that will be deserialized back to `undefined`
    else if (_.isUndefined(value)) {
        return { $type: 'undefined' };
    }

    // TODO: Map a slow object...
    else if (_.isObject(value) && _.has(value, '_slow')) {
        if (treatSlowObjectsAsRefs) {
            return {
                $type: 'SlowObjectReference',
                value: _.pick(value._slow, ['type', 'id'])
            };
        }
        else {
            return {
                $type: 'SlowObjectDefinition',
                value: _.mapValues(value._slow, propValue => toJSONSafeObject(propValue, true))
            };
        }
    }

    // TODO: temp testing... remove this...
    else {
        return { $type: 'ERROR - UNKNOWN?!' };
    }


    // If we get to here, the value is not recognised. Throw an error.
    throw new Error(`toJSONSafeObject: value cannot be serialized: ${value}`);
}
