export = SlowType;


const enum SlowType {
    SlowEventLoop = 1,
    SlowPromise = 10,
    SlowPromiseResolve = 11,
    SlowPromiseReject = 12,
    SlowAsyncFunction = 20,
    SlowAsyncFunctionActivation = 30,
    SlowClosure = 50,
    SlowWeakRef = 60
}
