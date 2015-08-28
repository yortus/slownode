declare module "types" {
    import slow = require('slownode');


    // TODO: doc...
    // - These are the full shapes of the types used in this module, including 'private' definitions
    // - They are put here because (1) it forms a shared reference for internal code and (2) the public .d.ts should not contain provate stuff





    type Async = typeof slow.async;

    interface SlowAsyncFunction {
        _slow: {
            type: string;
            id?: string|number;
            source: string;
            originalSource: string;
        };
    }

    namespace SlowAsyncFunction {

        interface Activation extends SlowRoutine {
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





    interface SlowRoutine {
        next(value?: any): { done: boolean; value: any; };
        throw(value?: any): { done: boolean; value: any; };
        return(value?: any): { done: boolean; value: any; };
        state: any;
    }

    namespace SlowRoutine {

        interface Function {
            (...args: any[]): SlowRoutine;
            body: Function;
        }

        export var Function: {
            new(bodyFunction: Function, options?: Options): Function;
            (bodyFunction: Function, options?: Options): Function;
        };

        interface Options {
            yieldIdentifier?: string;
            constIdentifier?: string;
        }
    }





    // TODO: ...
    interface SlowObject {
        _slow: {
            type: string;
            id?: string|number;
            [other: string]: any;
        }
        [other: string]: any;
    }

    namespace SlowObject {

        interface Registration {
            type: string;
            rehydrate(jsonSafeObject: any): SlowObject;
        }
    }
}
