///// <reference path="../node/node.d.ts" />


//// TODO: add jsdoc comments in here...


//declare module "slownode" {

//    // ==================== Slow Primitives ====================
//    //export var Closure: SlowClosureStatic;

//    //interface SlowClosureStatic {
//    //    new(env: { [name: string]: any; }, fn: Function): SlowClosure;
//    //    (env: { [name: string]: any; }, fn: Function): SlowClosure;
//    //}

//    //interface SlowClosure {
//    //    // TODO: allow args?
//    //    (...args): any;
//    //}

//    //export function makeWeakRef(obj: any): void;

//    // ==================== Slow Event Loop ====================

//    //export function setTimeout(callback: Function, delay: number, ...args: any[]): EventLoop.Timer;

//    //export function clearTimeout(timeoutObject: EventLoop.Timer): void;

//    //export function setImmediate(callback: Function, ...args: any[]): EventLoop.Timer;

//    //export function clearImmediate(immediateObject: EventLoop.Timer): void;

//    //export namespace EventLoop {
//    //    type Timer = number;
//    //}



//    // ==================== async() and SlowAsyncFunction ====================

//    export function async<TReturn>(fn: () => TReturn): SlowAsyncFunctionNullary<TReturn>;
//    export function async<T1, TReturn>(fn: (_1: T1) => TReturn): SlowAsyncFunctionUnary<T1, TReturn>;
//    export function async<T1, T2, TReturn>(fn: (_1: T1, _2: T2) => TReturn): SlowAsyncFunctionBinary<T1, T2, TReturn>;
//    export function async<T1, T2, T3, TReturn>(fn: (_1: T1, _2: T2, _3: T3) => TReturn): SlowAsyncFunctionTernary<T1, T2, T3, TReturn>;
//    export function async<T1, T2, T3, T4, TReturn>(fn: (_1: T1, _2: T2, _3: T3, _4: T4) => TReturn): SlowAsyncFunctionQuaternary<T1, T2, T3, T4, TReturn>;
//    export function async<TReturn>(fn: (...args: any[]) => TReturn): SlowAsyncFunctionVariadic<TReturn>;
//    type SlowAsyncFunctionNullary<TReturn> = () => SlowPromise<TReturn>;
//    type SlowAsyncFunctionUnary<T1, TReturn> = (_1: T1) => SlowPromise<TReturn>;
//    type SlowAsyncFunctionBinary<T1, T2, TReturn> = (_1: T1, _2: T2) => SlowPromise<TReturn>;
//    type SlowAsyncFunctionTernary<T1, T2, T3, TReturn> = (_1: T1, _2: T2, _3: T3) => SlowPromise<TReturn>;
//    type SlowAsyncFunctionQuaternary<T1, T2, T3, T4, TReturn> = (_1: T1, _2: T2, _3: T3, _4: T4) => SlowPromise<TReturn>;
//    type SlowAsyncFunctionVariadic<TReturn> = (...args: any[]) => SlowPromise<any>;



//    // ==================== SlowPromise ====================

//    // TODO: This is just an alias of the SlowPromise constructor to support slow.Promise(...) usage...
//    export var Promise: typeof SlowPromise;

//    export class SlowPromise<T> {

//        // TODO: review types specified here:
//        constructor(resolver: (resolve: (value?: T | SlowThenable<T>) => void, reject: (error?: any) => void) => void);

//        // Static member functions
//        static resolved<T>(value?: T | SlowThenable<T>): SlowPromise<T>;
//        static rejected(error: any): SlowPromise<any>;
//        static deferred<T>(): SlowPromise.Deferred<T>;
//        static delay(ms: number): SlowPromise<void>;
//        // TODO: all, race... (see https://github.com/borisyankov/DefinitelyTyped/blob/master/es6-promise/es6-promise.d.ts)

//        // Methods
//        then<U>(onFulfilled?: (value: T) => U | SlowThenable<U>, onRejected?: (error: any) => U | SlowThenable<U>): SlowPromise<U>;
//        then<U>(onFulfilled?: (value: T) => U | SlowThenable<U>, onRejected?: (error: any) => void): SlowPromise<U>;
//        catch<U>(onRejected?: (error: any) => U | SlowThenable<U>): SlowPromise<U>;
//    }

//    interface SlowThenable<T> {
//        then<U>(onFulfilled?: (value: T) => U | SlowThenable<U>, onRejected?: (error: any) => U | SlowThenable<U>): SlowThenable<U>;
//        then<U>(onFulfilled?: (value: T) => U | SlowThenable<U>, onRejected?: (error: any) => void): SlowThenable<U>;
//    }

//    export namespace SlowPromise {

//        interface Deferred<T> {
//            promise: SlowPromise<T>;
//            resolve: Resolve<T>;
//            reject: Reject;
//        }

//        interface Resolve<T> {
//            (value?: T | SlowThenable<T>): void;
//        }

//        interface Reject {
//            (error?: any): void;
//        }
//    }
//}


//// The await and __const pseudo-keywords are global.
//declare var await: {
//    <T>(arg: Promise<T>): T;
//};

//declare var __const: <T>(init: T) => T;





//// TODO: assimilate...
////declare module "slownode-prev" {

////    export function setInterval(funct: () => any, delayMs: number, options ?: SlowOptions): Promise<number>;

////    export var EventEmitter: {
////        addListener(event: string, listener: (...args: any[]) => any, options?: SlowOptions): Promise<boolean>,
////        on(event: string, listener: (...args: any[]) => any, options?: SlowOptions): Promise<boolean>,
////        once(event: string, listener: (...args: any[]) => any, options?: SlowOptions): Promise<boolean>,
////        removeListener(event: string): Promise<boolean>,
////        removeListeners(event: string): Promise<boolean>,
////        listeners(event: string): Promise<Schema.EventListener[]>,
////        emit(event: string, ...args: any[]): Promise<boolean>
////    };
////}
