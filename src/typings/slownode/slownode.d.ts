/// <reference path="../knex/knex.d.ts" />
/// <reference path="../bluebird/bluebird.d.ts" />
/// <reference path="../node/node.d.ts" />


declare module "slownode" {

    // ==================== SlowValue ====================

    interface SlowInfo {

        /** Slow object type. One of: 'SlowAsyncFunction', 'SlowPromise', 'SlowPromiseResolveFunction', 'SlowPromiseRejectFunction' */
        type: string;

        /** Slow object persistent identifier. This is shared between the in-memory and in-storage representations of the slow object. */
        id: string|number;
    }


    // ==================== async() and SlowAsyncFunction ====================

    function async<TReturn>(fn: () => TReturn): SlowAsyncFunctionNullary<TReturn>;

    function async<T1, TReturn>(fn: (_1: T1) => TReturn): SlowAsyncFunctionUnary<T1, TReturn>;

    function async<T1, T2, TReturn>(fn: (_1: T1, _2: T2) => TReturn): SlowAsyncFunctionBinary<T1, T2, TReturn>;

    function async<T1, T2, T3, TReturn>(fn: (_1: T1, _2: T2, _3: T3) => TReturn): SlowAsyncFunctionTernary<T1, T2, T3, TReturn>;

    function async<T1, T2, T3, T4, TReturn>(fn: (_1: T1, _2: T2, _3: T3, _4: T4) => TReturn): SlowAsyncFunctionQuaternary<T1, T2, T3, T4, TReturn>;

    function async<TReturn>(fn: (...args: any[]) => TReturn): SlowAsyncFunctionVariadic<TReturn>;

    interface SlowAsyncFunction {
        _slow: SlowInfo;
    }

    interface SlowAsyncFunctionNullary<TReturn> extends SlowAsyncFunction {
        (): Promise<TReturn>;
    }

    interface SlowAsyncFunctionUnary<T1, TReturn> extends SlowAsyncFunction {
        (_1: T1): Promise<TReturn>;
    }

    interface SlowAsyncFunctionBinary<T1, T2, TReturn> extends SlowAsyncFunction {
        (_1: T1, _2: T2): Promise<TReturn>;
    }

    interface SlowAsyncFunctionTernary<T1, T2, T3, TReturn> extends SlowAsyncFunction {
        (_1: T1, _2: T2, _3: T3): Promise<TReturn>;
    }

    interface SlowAsyncFunctionQuaternary<T1, T2, T3, T4, TReturn> extends SlowAsyncFunction {
        (_1: T1, _2: T2, _3: T3, _4: T4): Promise<TReturn>;
    }

    interface SlowAsyncFunctionVariadic<TReturn> extends SlowAsyncFunction {
        (...args: any[]): Promise<any>;
    }


    // ==================== SlowPromise ====================

    var Promise: SlowPromiseStatic;

    interface SlowPromiseStatic {

        // TODO: review types specified here:
        new<T>(resolver: (resolve: (value?: T | SlowThenable<T>) => void, reject: (error?: any) => void) => void): SlowPromise<T>;
        <T>(resolver: (resolve: (value?: T | SlowThenable<T>) => void, reject: (error?: any) => void) => void): SlowPromise<T>;

        resolved<T>(value?: T | SlowThenable<T>): SlowPromise<T>;
        rejected(error: any): SlowPromise<any>;
        deferred<T>(): SlowPromiseDeferred<T>;
        // TODO: all, race... (see https://github.com/borisyankov/DefinitelyTyped/blob/master/es6-promise/es6-promise.d.ts)
        // TODO: rehydration...
    }

    interface SlowPromise<T> extends SlowThenable<T> {
        then<U>(onFulfilled?: (value: T) => U | SlowThenable<U>, onRejected?: (error: any) => U | SlowThenable<U>): SlowPromise<U>;
        then<U>(onFulfilled?: (value: T) => U | SlowThenable<U>, onRejected?: (error: any) => void): SlowPromise<U>;
        catch<U>(onRejected?: (error: any) => U | SlowThenable<U>): SlowPromise<U>;



        // TODO: temp testing...
        _slow: SlowInfo;
        _saved;
        _fulfil;
        _reject;
        _isFateResolved;
    }

    interface SlowThenable<T> {
        then<U>(onFulfilled?: (value: T) => U | SlowThenable<U>, onRejected?: (error: any) => U | SlowThenable<U>): SlowThenable<U>;
        then<U>(onFulfilled?: (value: T) => U | SlowThenable<U>, onRejected?: (error: any) => void): SlowThenable<U>;
    }

    interface SlowPromiseDeferred<T> {
        promise: SlowPromise<T>;
        resolve: SlowPromiseResolveFunction<T>;
        reject: SlowPromiseRejectFunction;
    }

    interface SlowPromiseResolveFunction<T> {
        (value?: T | SlowThenable<T>): void;
        _slow: SlowInfo;
    }

    interface SlowPromiseRejectFunction {
        (error?: any): void;
        _slow: SlowInfo;
    }

    const enum SlowPromiseState {
        Pending,
        Fulfilled,
        Rejected
    }


    // ==================== SlowRoutineFunction and SlowRoutine ====================

    export var SlowRoutineFunction: {
        new(bodyFunction: Function, options?: SlowRoutineOptions): SlowRoutineFunction;
        (bodyFunction: Function, options?: SlowRoutineOptions): SlowRoutineFunction;
    };

    interface SlowRoutineOptions {
        yieldIdentifier?: string;
        constIdentifier?: string;
    }

    interface SlowRoutineFunction {
        (...args: any[]): SlowRoutine;
        body: Function;
    }

    interface SlowRoutine {
        next(value?: any): { done: boolean; value: any; };
        throw(value?: any): { done: boolean; value: any; };
        return(value?: any): { done: boolean; value: any; };
        state: any;
    }
}


// The await and __const pseudo-keywords are global.
declare var await: {
    <T>(arg: Promise<T>): T;
};

declare var __const: <T>(init: T) => T;





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


    import Knex = require("knex");

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
