/// <reference path="../knex/knex.d.ts" />
/// <reference path="../bluebird/bluebird.d.ts" />
/// <reference path="../node/node.d.ts" />

declare module "slownode" {

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

    export function start(config: ISlowConfig): Promise<void>;
    export function stop(): Promise<void>;

    export function setTimeout(func: () => any, delayMs: number, options ?: ISlowOptions): Promise<number>;
    export function setImmediate(func: () => any, options ?: ISlowOptions): Promise<number>;
    export function setInterval(funct: () => any, delayMs: number, options ?: ISlowOptions): Promise<number>;

    export function SlowFunction(id: string, callback: (...args: any[]) => any, options ?: ISlowOptions): Promise<string>;
    export var EventEmitter: {
        addListener(event: string, listener: (...args: any[]) => any, options?: ISlowOptions): Promise<boolean>,
        on(event: string, listener: (...args: any[]) => any, options?: ISlowOptions): Promise<boolean>,
        once(event: string, listener: (...args: any[]) => any, options?: ISlowOptions): Promise<boolean>,
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

    export interface ISlowThenable {
        then: (onFulfill?: SlowPromise, onReject?: SlowPromise) => Promise<{ fulfill: number, reject: number }>;
        slowPromise: SlowPromise;
        isReady: Promise<number>;
    }

    export interface ISlowFunction {
        id?: string;
        body: (...args: any[]) => any;
        options: ISlowOptions;
    }

    export interface ISlowOptions {
        dependencies?: Array<IDependency>
        runAt?: number;
        runOnce?: number;
        intervalMs?: number;
        retryCount?: number;
        retryIntervalMs?: number;
        arguments?: {};
    }

    export interface IDependency {
        reference?: string;
        value?: any;
        as: string;
    }

    export interface ISlowConfig {
        pollIntervalMs?: number;
    }



    // TODO: used anywhere? ----------------
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