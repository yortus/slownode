declare module "types" {
    import slow = require('slownode');


    // TODO: doc...
    // - These are the full shapes of the types used in this module, including 'private' definitions
    // - They are put here because (1) it forms a shared reference for internal code and (2) the public .d.ts should not contain provate stuff





    type Async = typeof slow.async;

    interface SlowAsyncFunction {
        (...args): SlowPromise;
        stateMachine: Steppable.StateMachine;
        _slow: {
            type: SlowObject.Type;
            id?: string;
            stateMachineSource: string;
            originalSource: string; // TODO: not needed in operation, but preserve for future debugging/sourcemap needs?
        };
    }

    namespace SlowAsyncFunction {

        interface Activation extends SteppableObject {
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
                resumeNext: Activation.ResumeNext;

                /** Resumes execution with an error. */
                resumeError: Activation.ResumeError;

                /** Signals that the activation returned a result. */
                resolve: SlowPromise.Resolve;

                /** Signals that the activation threw an error. */
                reject: SlowPromise.Reject;
            };
        }

        namespace Activation {

            type ResumeNext = SlowObject & ((value) => void);

            type ResumeError = SlowObject & ((error) => void);
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
            resolve: Resolve;
            reject: Reject;
        }

        interface Resolve extends slow.SlowPromise.Resolve<any> {
            _slow: {
                type: SlowObject.Type;
                id?: string;
                promise: SlowPromise;
            };
        }

        interface Reject extends slow.SlowPromise.Reject {
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





    interface SteppableFunction {
        (...args: any[]): SteppableObject;
        stateMachine: Steppable.StateMachine;
    }

    export var SteppableFunction: {
        new(bodyFunc: Function, options?: Steppable.Options): SteppableFunction;
        (bodyFunc: Function, options?: Steppable.Options): SteppableFunction;
        fromStateMachine(stateMachine: Steppable.StateMachine): SteppableFunction;
    };

    interface SteppableObject {
        next(value?: any): { done: boolean; value: any; };
        throw(value?: any): { done: boolean; value: any; };
        return(value?: any): { done: boolean; value: any; };
        state: Steppable.StateMachine.State;
    }

    namespace Steppable {

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
            SlowPromiseResolve = 11,
            SlowPromiseReject = 12,
            SlowAsyncFunction = 20,
            SlowAsyncFunctionActivation = 30,
            SlowAsyncFunctionActivationResumeNext = 31,
            SlowAsyncFunctionActivationResumeError = 32
        }

        interface Registration {
            type: SlowObject.Type; // TODO: no longer needed. Remove?
            dehydrate(obj: any, recurse: (obj) => any): any; // TODO: returns a jsonSafeObject, or void 0 for 'unhandled'
            rehydrate(jsonSafeObject: any): any;
        }
    }
}


// TODO: is this used? needed?
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
