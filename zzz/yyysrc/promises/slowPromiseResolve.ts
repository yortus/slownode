//import SlowKind = require('../slowKind');
//import persistence = require('../persistence');
//import SlowPromise = require('./slowPromise'); // NB: elided circular ref (for types only)
//import makeCallableClass = require('../util/makeCallableClass');
//import standardResolutionProcedure = require('./standardResolutionProcedure');
//export = SlowPromiseResolve;


///**
// * Creates a SlowPromiseResolve instance. It may be called with or without `new`.
// * The SlowPromiseResolve instance may be used to resolve the given promise with a value.
// */
//var SlowPromiseResolve: {

//    /** Creates a SlowPromiseResolve instance. */
//    new(promise: SlowPromise): SlowPromiseResolve;

//    /** Creates a SlowPromiseResolve instance. */
//    (promise: SlowPromise): SlowPromiseResolve;
//}
//interface SlowPromiseResolve {

//    /** Calling the instance resolves the promise passed to the constructor, with `value` as the resolved value. */
//    (value?: any): void;

//    /** INTERNAL holds the full state of the instance in serializable form. An equivalent instance may be 'rehydrated' from this data. */
//    $slow: {
//        kind: SlowKind;
//        epochId: string;
//        id: string;
//        promise: SlowPromise;
//    };
//}


//// Create a constructor function whose instances (a) are callable and (b) work with instanceof.
//SlowPromiseResolve = <any> makeCallableClass({

//    // Create a new SlowPromiseResolve instance, tied to the given SlowPromise.
//    constructor: function (promise: SlowPromise) {

//        // Add slow metadata to the resolve function.
//        (<SlowPromiseResolve> this).$slow = {
//            kind: SlowKind.PromiseResolve,
//            epochId: promise ? promise.$slow.epochId : null,
//            id: null,
//            promise: promise
//        };

//        // Synchronise with the persistent object graph.
//        persistence.created(this); // TODO: temp testing...
//    },

//    // Calling the instance resolves the promise passed to the constructor, with `value` as the resolved value.
//    call: function (value?: any) {

//        // Resolve the promise using the standard resolution procedure.
//        var promise = (<SlowPromiseResolve> this).$slow.promise;
//        standardResolutionProcedure(promise, value);
//    }
//});





//// TODO: ==================== rehydration logic... temp testing... ====================
//persistence.howToRehydrate(SlowKind.PromiseResolve, $slow => {
//    var resolve = new SlowPromiseResolve(null);
//    resolve.$slow = <any> $slow;
//    return resolve;
//});
