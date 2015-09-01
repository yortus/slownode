/// <reference path="../bluebird/bluebird.d.ts" />
/// <reference path="../node/node.d.ts" />


// TODO: add jsdoc comments in here...


declare module "slownode" {



    // ==================== async() and SlowAsyncFunction ====================

    export function async<TReturn>(fn: () => TReturn): SlowAsyncFunctionNullary<TReturn>;
    export function async<T1, TReturn>(fn: (_1: T1) => TReturn): SlowAsyncFunctionUnary<T1, TReturn>;
    export function async<T1, T2, TReturn>(fn: (_1: T1, _2: T2) => TReturn): SlowAsyncFunctionBinary<T1, T2, TReturn>;
    export function async<T1, T2, T3, TReturn>(fn: (_1: T1, _2: T2, _3: T3) => TReturn): SlowAsyncFunctionTernary<T1, T2, T3, TReturn>;
    export function async<T1, T2, T3, T4, TReturn>(fn: (_1: T1, _2: T2, _3: T3, _4: T4) => TReturn): SlowAsyncFunctionQuaternary<T1, T2, T3, T4, TReturn>;
    export function async<TReturn>(fn: (...args: any[]) => TReturn): SlowAsyncFunctionVariadic<TReturn>;
    type SlowAsyncFunctionNullary<TReturn> = () => SlowPromise<TReturn>;
    type SlowAsyncFunctionUnary<T1, TReturn> = (_1: T1) => SlowPromise<TReturn>;
    type SlowAsyncFunctionBinary<T1, T2, TReturn> = (_1: T1, _2: T2) => SlowPromise<TReturn>;
    type SlowAsyncFunctionTernary<T1, T2, T3, TReturn> = (_1: T1, _2: T2, _3: T3) => SlowPromise<TReturn>;
    type SlowAsyncFunctionQuaternary<T1, T2, T3, T4, TReturn> = (_1: T1, _2: T2, _3: T3, _4: T4) => SlowPromise<TReturn>;
    type SlowAsyncFunctionVariadic<TReturn> = (...args: any[]) => SlowPromise<any>;



    // ==================== SlowPromise ====================

    // TODO: This is just an alias of the SlowPromise constructor to support slow.Promise(...) usage...
    export var Promise: typeof SlowPromise;

    export class SlowPromise<T> {

        // TODO: review types specified here:
        constructor(resolver: (resolve: (value?: T | SlowThenable<T>) => void, reject: (error?: any) => void) => void);

        // Static member functions
        static resolved<T>(value?: T | SlowThenable<T>): SlowPromise<T>;
        static rejected(error: any): SlowPromise<any>;
        static deferred<T>(): SlowPromise.Deferred<T>;
        static delay(ms: number): SlowPromise<void>;
        // TODO: all, race... (see https://github.com/borisyankov/DefinitelyTyped/blob/master/es6-promise/es6-promise.d.ts)

        // Methods
        then<U>(onFulfilled?: (value: T) => U | SlowThenable<U>, onRejected?: (error: any) => U | SlowThenable<U>): SlowPromise<U>;
        then<U>(onFulfilled?: (value: T) => U | SlowThenable<U>, onRejected?: (error: any) => void): SlowPromise<U>;
        catch<U>(onRejected?: (error: any) => U | SlowThenable<U>): SlowPromise<U>;
    }

    interface SlowThenable<T> {
        then<U>(onFulfilled?: (value: T) => U | SlowThenable<U>, onRejected?: (error: any) => U | SlowThenable<U>): SlowThenable<U>;
        then<U>(onFulfilled?: (value: T) => U | SlowThenable<U>, onRejected?: (error: any) => void): SlowThenable<U>;
    }

    export namespace SlowPromise {

        interface Deferred<T> {
            promise: SlowPromise<T>;
            resolve: ResolveFunction<T>;
            reject: RejectFunction;
        }

        interface ResolveFunction<T> {
            (value?: T | SlowThenable<T>): void;
        }

        interface RejectFunction {
            (error?: any): void;
        }
    }
}


// The await and __const pseudo-keywords are global.
declare var await: {
    <T>(arg: Promise<T>): T;
};

declare var __const: <T>(init: T) => T;





// TODO: assimilate...
declare module "slownode-prev" {

    export var ready: Promise<void>;

    // TODO: temp testing...
    export function Callback(functionId: string, ...args: any[]): Promise<any>;
    //export var DEBUG: boolean;
    export var errors: {
        FunctionExists: string;
        NoHandler: string;
        InvalidDatabaseName: string;
        MustBeNumber: string;
        InvalidPollDelay: string;
        NotInfinity: string;
        InvalidConnection: string;
        DatabaseInvalid: string;
        MustBeFunction: string;
        MustBeString: string;
        UnableToDeserialise: string;
        DidNotParseAsFunction: string;
        DatabaseInitFailed: string;
        TimedFuncsMustHaveOptions: string;
    }



    export function start(config: SlowConfig): Promise<void>;
    export function stop(): Promise<void>;

    export function setTimeout(func: () => any, delayMs: number, options ?: SlowOptions): Promise<number>;
    export function setImmediate(func: () => any, options ?: SlowOptions): Promise<number>;
    export function setInterval(funct: () => any, delayMs: number, options ?: SlowOptions): Promise<number>;

    export function SlowFunction(id: string, callback: (...args: any[]) => any, options ?: SlowOptions): Promise<string>;
    export var EventEmitter: {
        addListener(event: string, listener: (...args: any[]) => any, options?: SlowOptions): Promise<boolean>,
        on(event: string, listener: (...args: any[]) => any, options?: SlowOptions): Promise<boolean>,
        once(event: string, listener: (...args: any[]) => any, options?: SlowOptions): Promise<boolean>,
        removeListener(event: string): Promise<boolean>,
        removeListeners(event: string): Promise<boolean>,
        listeners(event: string): Promise<Schema.EventListener[]>,
        emit(event: string, ...args: any[]): Promise<boolean>
    };

    export interface SlowPromise {
        id?: number;
        funcId: string;
        state: PromiseState;
        onFulfill: number;
        onReject: number;
        value: any;
    }
    
    export const enum PromiseState {
        Pending,
        Fulfilled,
        Rejected
    }

    export interface SlowThenable {
        then: (onFulfill?: SlowPromise, onReject?: SlowPromise) => Promise<{ fulfill: number, reject: number }>;
        slowPromise: SlowPromise;
        isReady: Promise<number>;
    }

    export interface SlowFunction {
        id?: string;
        body: (...args: any[]) => any;
        options: SlowOptions;
    }

    export interface SlowOptions {
        dependencies?: Array<Dependency>
        runAt?: number;
        runOnce?: number;
        intervalMs?: number;
        retryCount?: number;
        retryIntervalMs?: number;
        arguments?: {};
    }

    export interface Dependency {
        reference?: string;
        value?: any;
        as: string;
    }

    export interface SlowConfig {
        pollIntervalMs?: number;
    }


    export module Schema {

        export interface Function {
            id?: string;
            body: string;
            dependencies: string;
            isPromise?: number;
            intervalMs?: number;
            retryCount?: number;
            retryIntervalMs?: number;
            callOnce?: number;
        }

        export interface EventLoop {
            id?: number;
            funcId: string;
            runAt?: number;
            runAtReadable?: string;
            arguments?: string;
        }

        export interface EventListener {
            id?: number;
            topic: string;
            funcId: string;
        }

        export interface Promise {
            id?: number;
            funcId: string;
            state?: number;
            onFulfull?: number;
            onReject?: number;
            value: string;
        }
    }
}
