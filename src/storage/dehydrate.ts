﻿import _ = require('lodash');
import typeRegistry = require('./typeRegistry');
import isRelocatableFunction = require('../functions/isRelocatableFunction');
export = dehydrate;


/**
 * Recursively converts the given value into an object that can be safely converted to JSON.
 * Throws an error if any part of the value cannot be converted.
 */
function dehydrate(value: any, treatSlowObjectsAsRefs = false) {

    // Some primitives are already safe. Return them unchanged.
    if (_.isString(value) || _.isNumber(value) || _.isBoolean(value) || _.isNull(value)) {
        return value;
    }

    // TODO: Map a slow object...
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
                value: _.mapValues(value._slow, propValue => dehydrate(propValue, true))
            };
        }
    }

    // Map an array of values to an array of safe values.
    else if (_.isArray(value)) {
        return value.map(elem => dehydrate(elem, treatSlowObjectsAsRefs));
    }

    // Map a plain (and non-slow) object to a new object whose property values are safe values.
    else if (_.isPlainObject(value) && !_.has(value, '_slow')) {
        return _.mapValues(value, propValue => dehydrate(propValue, treatSlowObjectsAsRefs));
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
    else {
        return { $type: 'ERROR - UNKNOWN?!' };
    }


    // If we get to here, the value is not recognised. Throw an error.
    throw new Error(`dehydration not supported for value : ${value}`);
}