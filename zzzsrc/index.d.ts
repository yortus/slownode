// TODO: any way to reduce duplication of comments and structure with implementation files?


/**
 * Marks the given object as a weak-referenced slow object. WeakRefs are serializable
 * regardless of what they contain, however they are effectively serialized as `null`.
 * Therefore, code using WeakRefs must always check for null before dereferencing them,
 * as they may become null between every tick of the slow event loop, due to the
 * possibility of the process stopping and restarting, and the epoch hence resuming
 * with rehydrated slow objects.
 * @param obj the object to mark as a weak-referenced slow object. It must be an object type.
 */
export function makeWeakRef(obj: any): void;


/**
 * Creates a SlowClosure instance. It may be called with or without `new`.
 * A slow closure combines a function and a referencing environment. Calling
 * a slow closure causes its function to be executed with its environment
 * bindings added to its scope chain.
 */
export var Closure: {

    /** Creates a new SlowClosure instance. */
    new(env: { [name: string]: any; }, fn: Function): Closure;

    /** Creates a new SlowClosure instance. */
    (env: { [name: string]: any; }, fn: Function): Closure;
}
interface Closure {

    /** Calling the SlowClosure executes the function passed to the constructor in the environment passed to the constructor. */
    (...args): any;
}


/**
 * Schedules `callback` to be called with the given `args` (if any) after `delay` milliseconds.
 * Returns an opaque Timer object that may be passed to clearTimeout() to cancel the scheduled call.
 * @param callback the function to execute after the timeout.
 * @param delay the number of milliseconds to wait before calling the callback.
 * @param args the optional arguments to pass to the callback.
 */
export function setTimeout(callback: Function, delay: number, ...args: any[]): Timer;


/**
 * Cancels an event previously scheduled with setTimeout.
 * @param timeoutObject an opaque Timer object that was returned by a prior call to setTimeout.
 */
export function clearTimeout(timeoutObject: Timer);


/**
 * Schedules `callback` to be called with the given `args` (if any) on the next tick of the slow event loop.
 * Returns an opaque Timer object that may be passed to clearImmediate() to cancel the scheduled call.
 * @param callback the function to execute on the next tick of the slow event loop.
 * @param args the optional arguments to pass to the callback.
 */
export function setImmediate(callback: Function, ...args: any[]): Timer;


/**
 * Cancels an event previously scheduled with setImmediate.
 * @param timeoutObject an opaque Timer object that was returned by a prior call to setImmediate.
 */
export function clearImmediate(immediateObject: Timer): void;


// The opaque Timer object use with setTimeout et al.
declare type Timer = number;


/** Promises A+ compliant slow promise implementation. */
export class Promise<T> {

    /** Constructs a SlowPromise instance. */
    constructor(resolver: (resolve: (value?: T | Thenable<T>) => void, reject: (error?: any) => void) => void);

    /** Returns a new SlowPromise instance that is already resolved with the given value. */
    static resolved<T>(value?: T | Thenable<T>): Promise<T>;

    /** Returns a new SlowPromise instance that is already rejected with the given reason. */
    static rejected(reason: any): Promise<any>;

    /** Returns an object containing a new SlowPromise instance, along with a resolve function and a reject function to control its fate. */
    static deferred(): Deferred;

    /** Returns a new SlowPromise instance that resolves after `ms` milliseconds. */
    static delay(ms: number): Promise<void>;

	/**
     * onFulfilled is called when the promise resolves. onRejected is called when the promise rejects.
     * Both callbacks have a single parameter , the fulfillment value or rejection reason.
     * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve.
     * If an error is thrown in the callback, the returned promise rejects with that error.
     * @param onFulfilled called when/if "promise" resolves
     * @param onRejected called when/if "promise" rejects
     */
    then<U>(onFulfilled?: (value: T) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>): Promise<U>;
    then<U>(onFulfilled?: (value: T) => U | Thenable<U>, onRejected?: (error: any) => void): Promise<U>;

    /**
     * Sugar for promise.then(undefined, onRejected)
     * @param onRejected called when/if "promise" rejects
     */
    catch<U>(onRejected?: (error: any) => U | Thenable<U>): Promise<U>;
}


// A promise-like type.
interface Thenable<T> {
    then<U>(onFulfilled?: (value: T) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>): Thenable<U>;
    then<U>(onFulfilled?: (value: T) => U | Thenable<U>, onRejected?: (error: any) => void): Thenable<U>;
}


// Slow promise resolve function.
declare type Resolve<T> = (value?: T | Thenable<T>) => void;


// Slow promise reject function.
declare type Reject = (reason?: any) => void;


// The type of object returned by SlowPromise's deferred() static method.
interface Deferred {
    promise: Promise<any>;
    resolve: Resolve<any>;
    reject: Reject;
}


/** Creates a slow async function, which is analogous to an ES7 async function. */
export function async<TReturn>(fn: () => TReturn): SlowAsyncFunctionNullary<TReturn>;


/** Creates a slow async function, which is analogous to an ES7 async function. */
export function async<T1, TReturn>(fn: (_1: T1) => TReturn): SlowAsyncFunctionUnary<T1, TReturn>;


/** Creates a slow async function, which is analogous to an ES7 async function. */
export function async<T1, T2, TReturn>(fn: (_1: T1, _2: T2) => TReturn): SlowAsyncFunctionBinary<T1, T2, TReturn>;


/** Creates a slow async function, which is analogous to an ES7 async function. */
export function async<T1, T2, T3, TReturn>(fn: (_1: T1, _2: T2, _3: T3) => TReturn): SlowAsyncFunctionTernary<T1, T2, T3, TReturn>;


/** Creates a slow async function, which is analogous to an ES7 async function. */
export function async<T1, T2, T3, T4, TReturn>(fn: (_1: T1, _2: T2, _3: T3, _4: T4) => TReturn): SlowAsyncFunctionQuaternary<T1, T2, T3, T4, TReturn>;


/** Creates a slow async function, which is analogous to an ES7 async function. */
export function async<TReturn>(fn: (...args: any[]) => TReturn): SlowAsyncFunctionVariadic<TReturn>;


// Slow async function type variations.
declare type SlowAsyncFunctionNullary<TReturn> = () => Promise<TReturn>;
declare type SlowAsyncFunctionUnary<T1, TReturn> = (_1: T1) => Promise<TReturn>;
declare type SlowAsyncFunctionBinary<T1, T2, TReturn> = (_1: T1, _2: T2) => Promise<TReturn>;
declare type SlowAsyncFunctionTernary<T1, T2, T3, TReturn> = (_1: T1, _2: T2, _3: T3) => Promise<TReturn>;
declare type SlowAsyncFunctionQuaternary<T1, T2, T3, T4, TReturn> = (_1: T1, _2: T2, _3: T3, _4: T4) => Promise<TReturn>;
declare type SlowAsyncFunctionVariadic<TReturn> = (...args: any[]) => Promise<any>;


// TODO: ???
//// The await and __const pseudo-keywords are global.
//declare var await: {
//    <T>(arg: Promise<T>): T;
//};

//declare var __const: <T>(init: T) => T;
