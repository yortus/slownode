//import SlowType = require('../slowType');
//export interface SlowPromiseStatic {
//    new(resolver: (resolve: SlowPromiseResolve, reject: SlowPromiseReject) => void): SlowPromise;
//    (resolver: (resolve: SlowPromiseResolve, reject: SlowPromiseReject) => void): SlowPromise;
//}
//export interface SlowPromise {
//    then: any; // TODO: ...
//    catch: any; // TODO: ...
//    $slow: {
//        type: SlowType;
//        id?: string;
//        isFateResolved: boolean;
//        state: SlowPromise.State;
//        settledValue: any;
//        handlers: any[];
//    };
//    _fulfil(value?): void;
//    _reject(reason?): void;
//}
//export namespace SlowPromise {
//    export interface Deferred {
//        promise: SlowPromise;
//        resolve: SlowPromiseResolve;
//        reject: SlowPromiseReject;
//    }
//    export const enum State {
//        Pending,
//        Fulfilled,
//        Rejected
//    }
//}
////export interface SlowPromiseResolveStatic {
////    new(promise: SlowPromise): SlowPromiseResolve;
////    (promise: SlowPromise): SlowPromiseResolve;
////}
////export interface SlowPromiseResolve {
////    (value?: any): void;
////    $slow: {
////        type: SlowType;
////        id?: string;
////        promise: SlowPromise;
////    };
////}
////export interface SlowPromiseRejectStatic {
////    new(promise: SlowPromise): SlowPromiseReject;
////    (promise: SlowPromise): SlowPromiseReject;
////}
////export interface SlowPromiseReject {
////    (reason?: any): void;
////    $slow: {
////        type: SlowType;
////        id?: string;
////        promise: SlowPromise;
////    };
////}
//# sourceMappingURL=types.js.map