declare module "types" {


    // TODO: doc...
    // - These are the full shapes of the types used in this module, including 'private' definitions
    // - They are put here because (1) it forms a shared reference for internal code and (2) the public .d.ts should not contain provate stuff


    import slow = require('slownode');


    type Async = typeof slow.async;


    interface SlowAsyncFunction {
        _slow: {
            type: string;
            id?: string|number;
            source: string;
            originalSource: string;
        };
    }


    interface SlowAsyncFunctionActivation extends SlowRoutine {
        _slow: {
            type: string;
            id?: string|number;
            asyncFunction: SlowAsyncFunction,
            state: any, // TODO: may include Slow object refs
            awaiting: any, // TODO: may be a slow object ref / may include slow object refs
            resolve: slow.SlowPromise.ResolveFunction<any>, // TODO: is a slow object
            reject: slow.SlowPromise.RejectFunction // TODO: is a slow object
        };
    }


    interface SlowPromise extends slow.SlowPromise<any> {
        _slow: {
            type: string;
            id?: string|number;
            isFateResolved: boolean;
            state: SlowPromise.State;
            settledValue: any; // TODO: may include Slow object refs
            handlers: any[]; // TODO: may include SlowAsyncFunction refs
        };
        _fulfil(value?): void;
        _reject(reason?): void;
    }


    export namespace SlowPromise {


        interface Deferred extends slow.SlowPromise.Deferred<any> {
            promise: SlowPromise;
            resolve: ResolveFunction;
            reject: RejectFunction;
        }


        interface ResolveFunction extends slow.SlowPromise.ResolveFunction<any> {
            _slow: {
                type: string;
                id?: string|number;
                promise: SlowPromise;
            };
        }


        interface RejectFunction extends slow.SlowPromise.RejectFunction {
            _slow: {
                type: string;
                id?: string|number;
                promise: SlowPromise;
            };
        }


        const enum State {
            Pending,
            Fulfilled,
            Rejected
        }
    }


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





    // TODO: ...

    export interface SlowObject {
        _slow: {
            type: string;
            id?: string|number;
            [other: string]: any;
        }
        [other: string]: any;
    }






}
