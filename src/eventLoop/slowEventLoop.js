// TODO: doc... ???
global.setTimeout(runLoop, 200);
// TODO: doc...
// TODO: should return a token for use with clearTimeout
function setTimeout(callback, delay) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var entry = {
        event: {
            type: 0 /* TimerEvent */,
            due: Date.now() + delay
        },
        callback: callback,
        arguments: args
    };
    entries.push(entry);
    // TODO: return token...
}
exports.setTimeout = setTimeout;
// TODO: doc...
// TODO: should return a token for use with clearTimeout
function setImmediate(callback) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return setTimeout(callback, 0, args);
}
exports.setImmediate = setImmediate;
// TODO: doc...
var entries = [];
// TODO: doc...
var slowPollInterval = 200;
// TODO: doc...
function runLoop() {
    //// TODO: temp testing...
    //process.stdout.write(`==================== EVENT LOOP FLUSH `);
    // TODO: traverse all entries once...
    var thisLoop = entries;
    entries = [];
    while (thisLoop.length > 0) {
        //// TODO: temp testing...
        //process.stdout.write(`.`);
        var entry = thisLoop.shift();
        switch (entry.event.type) {
            case 0 /* TimerEvent */:
                var ev = entry.event;
                if (Date.now() >= ev.due) {
                    entry.callback.apply(void 0, entry.arguments);
                }
                else {
                    entries.push(entry);
                }
                break;
            default:
                throw new Error("Unhandled event type in entry: " + JSON.stringify(entry));
        }
    }
    //// TODO: temp testing...
    //process.stdout.write(`\n`);
    // TODO: persist state
    // TODO: if finished?... exit?
    if (entries.length === 0) {
        console.log("==================== EVENT LOOP EMPTY =========================");
    }
    // TODO: prep for next run
    global.setTimeout(runLoop, slowPollInterval);
}
// Tell storage how to restore the slow event loop.
//storage.registerSlowObjectFactory(SlowType.SlowPromise, $slow => {
//    var promise = new SlowPromise(null);
//    promise.$slow = <any> $slow;
//    return promise;
//});
//# sourceMappingURL=slowEventLoop.js.map