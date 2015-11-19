//import vm = require('vm');
//import SlowKind = require('../slowKind');
//import persistence = require('../persistence');
//import isRelocatableFunction = require('../util/isRelocatableFunction');
//import evalInContext = require('../util/evalInContext');
//import slowEventLoop = require('./slowEventLoop');
//// TODO: doc...
//export function createSetTimeoutFunction(epoch: vm.Context) {
//    return function setTimeout(code: Function|string, delay: number, ...args: any[]) {
//        if (typeof code === 'string') {
//            code = <any> vm.runInContext(`(function () {\n${code}\n})`, epoch);
//            args = [];
//        }
//        var timer = new Timer(epoch, delay, <Function> code, args);
//        slowEventLoop.add(timer);
//        return timer;
//    };
//}
//// TODO: doc...
//export function clearTimeout(timeoutObject: Timer) {
//    timeoutObject.cancel();
//}
//// TODO: doc...
//export class Timer implements slowEventLoop.Entry {
//    constructor(epoch: vm.Context, delay: number, callback: Function, args: any[]) {
//        if (!isRelocatableFunction(callback)) {
//            throw new Error(`Timer: callback is not a relocatable function: ${(callback || '[null]').toString()}.`);
//        }
//        this.$slow = {
//            kind: SlowKind.Timer,
//            epochId: 'temp', // TODO: ...
//            id: null,
//            due: Date.now() + delay,
//            code: callback.toString(),
//            arguments: args
//        };
//        persistence.created(this);
//        this.dispatch = () => {
//            persistence.deleted(this);
//            var closure = <Function> <any> vm.runInContext('(' + this.$slow.code + ')', epoch);
//            closure.apply(null, args);
//        };
//    }
//    isBlocked() {
//        return this.$slow.due > Date.now();
//    }
//    dispatch: () => void;
//    cancel() {
//        persistence.deleted(this);
//        slowEventLoop.remove(this);
//    }
//    $slow: {
//        kind: SlowKind;
//        epochId: string;
//        id: string;
//        due: number;
//        code: string;
//        arguments: any[];
//    };
//}
//// TODO: ==================== rehydration logic... temp testing... ====================
//persistence.howToRehydrate(SlowKind.Timer, ($slow, epoch) => {
//    var timer = new Timer(epoch, 0, ()=>{}, []);
//    timer.$slow = <any> $slow;
//    return timer;
//});
//# sourceMappingURL=slowTimers.js.map