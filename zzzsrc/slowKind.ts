export = SlowKind;


/** All supported SlowObject kinds. */
const enum SlowKind {
    EventLoop = 1,
    Promise = 10,
    PromiseResolve = 11,
    PromiseReject = 12,
    AsyncFunction = 20,
    AsyncFunctionActivation = 30,
    Closure = 50,
    WeakRef = 60
}
