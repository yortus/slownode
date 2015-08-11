import Types = require("slownode");
import store = require("../store/index");


var SlowPromise = (() => {
    
    var fn: any = create;
    fn.then = then;
    fn.catch = fail;
    
})();

function create(callback) {
    
}

function then(callback) {
    
}

function fail(callback) {
    
}

function run(promiseId: string) {
    
}