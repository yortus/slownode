declare module "types" {
    import slow = require('slownode');


    // TODO: doc...
    // - These are the full shapes of the types used in this module, including 'private' definitions
    // - They are put here because (1) it forms a shared reference for internal code and (2) the public .d.ts should not contain provate stuff





    type Async = typeof slow.async;

    interface SlowAsyncFunction {
        stateMachine: Steppable.StateMachine;
        _slow: {
            type: string;
            id?: string|number;
            stateMachineSource: string;
            originalSource: string; // TODO: not needed in operation, but preserve for future debugging/sourcemap needs?
        };
    }

    namespace SlowAsyncFunction {

        interface Activation extends Steppable {
            _slow: {
                type: string;
                id?: string|number;
                asyncFunction: SlowAsyncFunction;
                state: Steppable.StateMachine.State;
                awaiting: any;
                resolve: slow.SlowPromise.ResolveFunction<any>;
                reject: slow.SlowPromise.RejectFunction;
            };
        }
    }





    interface SlowPromise extends slow.SlowPromise<any> {
        _slow: {
            type: string;
            id?: string|number;
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
            yieldIdentifier?: string;
            constIdentifier?: string;
        }

        type StateMachine = (state: StateMachine.State) => void;

        namespace StateMachine {

            interface State {
                pos?: string;
                local?: { [name: string]: any; };
                temp?: { [name: string]: any; };
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
