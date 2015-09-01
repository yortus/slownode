import assert = require('assert');
import _ = require('lodash');
import types = require('types');
import typeRegistry = require('./typeRegistry');
export = rehydrate;


// TODO: doc... this is unwrapJSONSafeObject by another name...


/**
 * TODO: Recursively converts the given json-safe object back to a normal value.
 * Throws an error if any part of the value cannot be converted.
 */
function rehydrate(jsonSafeObject: any, getSlowObjectDef: (id: string) => types.SlowObject) {

    // Some primitives map to themselves. Return them as-is.
    if (_.isString(jsonSafeObject) || _.isNumber(jsonSafeObject) || _.isBoolean(jsonSafeObject) || _.isNull(jsonSafeObject)) {
        return jsonSafeObject;
    }

    // TODO: map a slow object reference...
    else if (jsonSafeObject && jsonSafeObject.$ref) {
        return getSlowObjectDef(jsonSafeObject.$ref);
    }

    // Map an array of JSON-safe values to an array of rehydrated values.
    else if (_.isArray(jsonSafeObject)) {
        return jsonSafeObject.map(element => rehydrate(element, getSlowObjectDef));
    }

    // Map a plain (and non-special) object to an equivalent object whose property values have been rehydrated.
    else if (_.isPlainObject(jsonSafeObject) && !('$type' in jsonSafeObject)) {
        return _.mapValues(jsonSafeObject, propValue => rehydrate(propValue, getSlowObjectDef));
    }

    // Map the sentinel value for `undefined` back to `undefined`.
    else if (jsonSafeObject && jsonSafeObject.$type === 'undefined') {
        return void 0;
    }

    // TODO: doc...
    else if (jsonSafeObject && jsonSafeObject.$type === 'function') {
        return eval('(' + jsonSafeObject.value + ')');
    }

    // TODO: doc...
    else if (jsonSafeObject && jsonSafeObject.$type === 'error') {
        return new Error(jsonSafeObject.value);
    }

    // If we get to here, the value is not recognised. Throw an error.
    throw new Error(`rehydration not supported for value: ${jsonSafeObject}`);
}
