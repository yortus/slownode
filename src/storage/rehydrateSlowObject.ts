//import assert = require('assert');
//import _ = require('lodash');
//import types = require('types');
//import typeRegistry = require('./typeRegistry');
//export = rehydrate;


//// TODO: doc... this is unwrapJSONSafeObject by another name...


///**
// * TODO: Recursively converts the given dehydrated slow object back to a normal slow object.
// * Throws an error if any part of the value cannot be converted.
// */
//function rehydrateSlowObject(dehydratedSlowObject: types.SlowObject, allSlowObjects: {[id: string]: types.SlowObject}): types.SlowObject {
//    assert(allSlowObjects[dehydratedSlowObject.$slow.id]);

//    // TODO: temp testing... need to use factory, chosen based on $slow.type
//    return rehydrate(dehydratedSlowObject.$slow, allSlowObjects);
//}


///**
// * TODO: Recursively converts the given json-safe value back to a normal value.
// * Throws an error if any part of the value cannot be converted.
// */
//function rehydrate(jsonSafe: any, allSlowObjects: Set<types.SlowObject>) {

//    // Some primitives map to themselves. Return them as-is.
//    if (_.isString(jsonSafe) || _.isNumber(jsonSafe) || _.isBoolean(jsonSafe) || _.isNull(jsonSafe)) {
//        return jsonSafe;
//    }

//    // Map a shorthand $ref object to the object it references
//    else if (allSlowObjects.has(jsonSafe)) {
//        return { $ref: value.$slow.id };
//    }

//    // Map an array of JSON-safe values to an array of rehydrated values.
//    else if (_.isArray(jsonSafe)) {
//        return jsonSafe.map(v => rehydrate(v, allSlowObjects));
//    }

//    // Map a plain (and non-special) object to an equivalent object whose property values have been rehydrated.
//    else if (jsonSafe && jsonSafe.$type === 'object') {

//        return _.mapValues(jsonSafe.value, rehydrate);
//    }

//    // Map the sentinel value for `undefined` back to `undefined`.
//    else if (jsonSafe && jsonSafe.$type === 'undefined') {
//        return void 0;
//    }

//    // TODO: doc...
//    else if (jsonSafe && jsonSafe.$type === 'function') {
//        return eval('(' + jsonSafe.value + ')');
//    }

//    // TODO: doc...
//    else if (jsonSafe && jsonSafe.$type === 'error') {
//        return new Error(jsonSafe.value);
//    }

//    // TODO: temp testing... else return as-is (already processed)
//    //else return jsonSafe;

//    // If we get to here, the value is not recognised. Throw an error.
//    throw new Error(`rehydration not supported for value: ${jsonSafe}`);
//}
