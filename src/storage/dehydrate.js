var _ = require('lodash');
var isRelocatableFunction = require('../functions/isRelocatableFunction');
/**
 * Recursively converts the given value into an object that can be safely converted to JSON.
 * Throws an error if any part of the value cannot be converted.
 */
function dehydrate(value) {
    // Some primitives map to themselves. Return them as-is.
    if (_.isString(value) || _.isNumber(value) || _.isBoolean(value) || _.isNull(value)) {
        return value;
    }
    else if (_.isObject(value) && _.has(value, '_slow')) {
        return { $ref: value._slow.id };
    }
    else if (_.isArray(value)) {
        return value.map(dehydrate);
    }
    else if (_.isPlainObject(value) && !_.has(value, '_slow')) {
        return _.mapValues(value, dehydrate);
    }
    else if (_.isUndefined(value)) {
        return { $type: 'undefined' };
    }
    else if (_.isFunction(value)) {
        if (isRelocatableFunction(value))
            return { $type: 'function', value: value.toString() };
        throw new Error("dehydration not supported for non-relocatable function: " + value);
    }
    else if (value && value.constructor === Error) {
        return { $type: 'error', value: value.message };
    }
    // TODO: temp testing... remove this...
    //else {
    //    return { $type: 'ERROR - UNKNOWN?!' };
    //}
    // If we get to here, the value is not recognised. Throw an error.
    throw new Error("dehydration not supported for value : " + value);
}
module.exports = dehydrate;
//# sourceMappingURL=dehydrate.js.map