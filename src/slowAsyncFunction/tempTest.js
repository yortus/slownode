var EventLoop;
(function (EventLoop) {
    function publish(event) { throw 0; }
    function subscribe(subscriber) { } // handle, ignore, or fail
    var config;
})(EventLoop || (EventLoop = {}));
// Activated (somehow) when a leave requests is created...
var approvalWorkflow1 = slowfunc(function (leaveRequestId) {
    // control flow
    while (true) {
        // Wait a potentially long time... This is a special marker point that can withstand crashes/restarts/long periods
        var evt = longwait.any([
            SlowPromise.fromNotification("/leaveRequests/" + leaveRequestId + "/feed/*"),
            SlowPromise.delay('2 days')
        ]);
        if (!evt) {
        }
        else {
            // Something happened to our leave request...
            var feedItemId = getFeedItemId(evt.id);
            var feedItem = tables('lrFeed').select(feedItemId);
            if (feedItem.type == 'appproved') {
            }
            else if (feedItem.type == 'rejected') {
            }
            else if (feedItem.type == 'cancelled') {
            }
        }
    }
});
//# sourceMappingURL=tempTest.js.map