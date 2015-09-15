function enqueue(entry) {
    events.push(entry);
}
exports.enqueue = enqueue;
function dequeue() {
    return events.shift();
}
exports.dequeue = dequeue;
var events = [];
// Tell storage how to restore the slow event loop.
//storage.registerSlowObjectFactory(SlowType.SlowPromise, $slow => {
//    var promise = new SlowPromise(null);
//    promise.$slow = <any> $slow;
//    return promise;
//});
//# sourceMappingURL=slowEventLoop.js.map