declare module "types" {


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
}
