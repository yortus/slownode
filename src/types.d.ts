declare module "types" {
    import slow = require('slownode');


    // TODO: doc...
    // - These are the full shapes of the types used in this module, including 'private' definitions
    // - They are put here because (1) it forms a shared reference for internal code and (2) the public .d.ts should not contain provate stuff





    type Async = typeof slow.async;

    interface SlowAsyncFunction {
        stateMachine: Steppable.StateMachine;
        _slow: {
            type: SlowObject.Type;
            id?: string;
            stateMachineSource: string;
            originalSource: string; // TODO: not needed in operation, but preserve for future debugging/sourcemap needs?
        };
    }

    namespace SlowAsyncFunction {

        interface Activation extends Steppable {
            _slow: {
                type: SlowObject.Type;
                id?: string;

                /** The body of code being executed by this activation. */
                asyncFunction: SlowAsyncFunction;

                /** State of all locals at the current point of suspended execution. */
                state: Steppable.StateMachine.State;

                /** The awaitable (ie slow promise) that must resolve before execution may resume. */
                awaiting: any;

                /** Resumes execution with a value. */
                onAwaitedResult: SlowObject & ((value) => void);

                /** Resumes execution with an error. */
                onAwaitedError: SlowObject & ((error) => void);

                /** Signals that the activation returned a result. */
                resolve: SlowPromise.ResolveFunction;

                /** Signals that the activation threw an error. */
                reject: SlowPromise.RejectFunction;
            };
        }
    }





    interface SlowPromise extends slow.SlowPromise<any> {
        _slow: {
            type: SlowObject.Type;
            id?: string;
            isFateResolved: boolean;
            state: SlowPromise.State;
            settledValue: any;
            handlers: any[];
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
                type: SlowObject.Type;
                id?: string;
                promise: SlowPromise;
            };
        }

        interface RejectFunction extends slow.SlowPromise.RejectFunction {
            _slow: {
                type: SlowObject.Type;
                id?: string;
                promise: SlowPromise;
            };
        }

        const enum State {
            Pending,
            Fulfilled,
            Rejected
        }
    }





    interface Steppable {
        next(value?: any): { done: boolean; value: any; };
        throw(value?: any): { done: boolean; value: any; };
        return(value?: any): { done: boolean; value: any; };
        state: Steppable.StateMachine.State;
    }

    namespace Steppable {

        interface Function {
            (...args: any[]): Steppable;
            stateMachine: StateMachine;
        }

        export var Function: {
            new(steppableBody: Function, options?: Options): Function;
            (steppableBody: Function, options?: Options): Function;
        };

        interface Options {
            pseudoYield?: string;
            pseudoConst?: string;
        }

        type StateMachine = (state: StateMachine.State) => void;

        namespace StateMachine {

            interface State {
                pos?: string;
                local?: { [name: string]: any; };
                temp?: { [name: string]: any; };
                ambient?: { [name: string]: any; };
                error?: {
                    occurred?: boolean;
                    value?: any;
                    handler?: string;
                };
                finalizers?: {
                    pending?: string[];
                    afterward?: string;
                };
                result?: any;
                incoming?: { type?: string; /* 'yield'|'throw'|'return' */ value?: any; };
                outgoing?: { type?: string; /* 'yield'|'throw'|'return' */ value?: any; };
            }
        }
    }





    // TODO: ...
    interface SlowObject {
        _slow: {
            type: SlowObject.Type;
            id?: string;
            [other: string]: any;
        }
        [other: string]: any;
    }

    namespace SlowObject {

        const enum Type {
            SlowPromise = 10,
            SlowPromiseResolveFunction = 11,
            SlowPromiseRejectFunction = 12,
            SlowAsyncFunction = 20,
            SlowAsyncFunctionActivation = 30,
            SlowAsyncFunctionContinuationWithResult = 31,
            SlowAsyncFunctionContinuationWithError = 32
        }

        interface Registration {
            type: SlowObject.Type; // TODO: no longer needed. Remove?
            dehydrate(obj: any, recurse: (obj) => any): any; // TODO: returns a jsonSafeObject, or void 0 for 'unhandled'
            rehydrate(jsonSafeObject: any): any;
        }
    }
}


declare module ESTree {
    export interface FunctionExpression {
        _ids: {
            local: {
                var: string[];
                let: string[];
                const: string[];
                catch: string[];
                all: string[];
            };
            module: string[];
            scoped: string[];
            global: string[];
        };
    }
}
