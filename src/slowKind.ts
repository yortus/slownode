export = SlowKind;


/** All supported SlowObject kinds. */
const enum SlowKind {
    Timer = 100,
    Promise = 200,
    PromiseResolve = 201,
    PromiseReject = 202,
    AsyncFunction = 300,
    AsyncFunctionActivation = 301,
    Closure = 400,
}
