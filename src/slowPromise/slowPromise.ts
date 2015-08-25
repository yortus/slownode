import Types = require('slownode');
import async = require("asyncawait/async");
import await = require("asyncawait/await");
//import databaseOperations = require('./databaseOperations');
import defer = require('./defer');
export = SlowPromise;


var SlowPromise: Types.SlowPromiseStatic<any> = <any> ((resolver: any) => {
    var result: Types.SlowPromiseStatic<any> = <any> {};

    // TODO: temp testing...

    return result;
});


SlowPromise.defer = (spid?: number) => {

    var promise: Types.SlowPromise<any> = {
        then: null,
        catch: null,
        _slow: null
    };

    var resolve;

    var reject;

    return { promise, resolve, reject };
};













/** Helper function for creating SlowPromise's `then` method body. */
function makeThenMethod() {
    return (x: any) => {
        return <Types.SlowPromise<any>> null;

    };
}
