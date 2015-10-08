import SlowClass = require('../slowClass');
import SlowLog = require('../slowLog');
export = makeSubClass;


// TODO: doc...
function makeSubClass<T extends typeof SlowClass>(SuperClass: T, slowLog: SlowLog): T {

    // TODO: temp testing... do we really need caching? See comment below...
    var cache: Map<any, T> = slowLog['cache'] || (slowLog['cache'] = new Map<any, T>());

    // Return the cached constructor if one has already been created.
    var cached = cache.get(SuperClass);
    if (cached) {
        // TODO: never entered so far. Really need caching?
        return cached;
    }

    // TODO: TS workaround, see https://github.com/Microsoft/TypeScript/issues/5163
    var Super: typeof Dummy = SuperClass;

    // TODO: 'normal' subclass but NB 'return super'...
    var Sub: T = <any> class extends Super {
        constructor(...args) {
            return <any> super(...args);
        }
    }

    // TODO: set slowLog...
    Sub.$slowLog = slowLog;


    // Cache and return the constructor function.
    cache.set(SuperClass, Sub);
    return Sub;
}


// TODO: TS workaround, see https://github.com/Microsoft/TypeScript/issues/5163
declare class Dummy { constructor(...args); }
