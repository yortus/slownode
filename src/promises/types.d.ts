declare module "types" {


    import slow = require('slownode');


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
}
