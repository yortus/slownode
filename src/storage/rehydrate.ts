import _ = require('lodash');
import typeRegistry = require('./typeRegistry');
export = rehydrate;


// TODO: doc... this is unwrapJSONSafeObject by another name...


/**
 * TODO: Recursively converts the given json-safe object back to a normal value.
 * Throws an error if any part of the value cannot be converted.
 */
function rehydrate(jsonSafeObject: any) {

    // Some primitives need no special processing. Return them as-is.
    if (_.isString(jsonSafeObject) || _.isNumber(jsonSafeObject) || _.isBoolean(jsonSafeObject) || _.isNull(jsonSafeObject)) {
        return jsonSafeObject;
    }

    // Map an array of JSON-safe values to an array of rehydrated values.
    else if (_.isArray(jsonSafeObject)) {
        return jsonSafeObject.map(rehydrate);
    }

    // Map a plain (and non-special) object to an equivalent object whose property values have been rehydrated.
    else if (_.isPlainObject(jsonSafeObject) && !('$type' in jsonSafeObject)) {
        return _.mapValues(jsonSafeObject, rehydrate);
    }

    // Map the sentinel value for `undefined` back to `undefined`.
    else if (jsonSafeObject && jsonSafeObject.$type === 'undefined') {
        return void 0;
    }

    // TODO: map a slow object reference...
    else if (jsonSafeObject && jsonSafeObject.$type === 'SlowRef') {
        // TODO: ...
        return null;
        throw 'Not implemented';
    }

    // TODO: map a slow object definition...
    else if (jsonSafeObject && jsonSafeObject.$type === 'SlowDef') {
        // TODO: ...
        return null;
        throw 'Not implemented';

        var slow: { type; id; } = _.mapValues(jsonSafeObject.value, rehydrate);

        //rehydrate

    }

    // If we get to here, the value is not recognised. Throw an error.
    throw new Error(`rehydration not supported for value: ${jsonSafeObject}`);
}
