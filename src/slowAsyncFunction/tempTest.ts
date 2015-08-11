namespace EventLoop {

    interface Event {
        topic: string;
    }

    interface Subscriber {
        id: string;
        options: {
            //allowDuplicates: boolean;
            //allowOmissions: boolean;
            onlyLatest: boolean;
        };
        handler: (event: Event) => Promise<void>;
    }

    function publish(event: Event): Promise<void> { throw 0; }

    function subscribe(subscriber: Subscriber) {} // handle, ignore, or fail


    var config: {
        retryCount: number;
        retryIntervalMs: number;

        pollIntervalMs: number;

        databaseConnection: {};
    };
}




// Rules:
// - control flow
//   - no closures
// - all variables must be either:
//   - arguments - must supply a persistent rehydration method (eg knex connections, module imports, etc, etc)
//   - locals - must be JSON-serialisable/deserialisable
declare var slowfunc;
declare var longwait;
declare var SlowPromise;
type SlowPromise = any;
declare var tables;
declare var getFeedItemId;


// Activated (somehow) when a leave requests is created...
var approvalWorkflow1 = slowfunc((leaveRequestId): SlowPromise => {

    // control flow
    while (true) {

        // Wait a potentially long time... This is a special marker point that can withstand crashes/restarts/long periods
        var evt = longwait.any([
            SlowPromise.fromNotification(`/leaveRequests/${leaveRequestId}/feed/*`),
            SlowPromise.delay('2 days')
        ]);

        if (!evt) {
            // must have timed out
            // what next? reminder? loop?
            // ...
        }

        else {

            // Something happened to our leave request...
            var feedItemId = getFeedItemId(evt.id);
            var feedItem = tables('lrFeed').select(feedItemId);
            if (feedItem.type == 'appproved') {
                //...
            }
            else if (feedItem.type == 'rejected') {
                //...
            }
            else if (feedItem.type == 'cancelled') {
                //...
            }
        }
    }
});
