import SlowObject = require('./slowObject');
import storage = require('./storage/storage');
export = SlowPool;


class SlowPool {

    // TODO: ...

    // TODO: temp testing... how to handle this really?
    static none = new SlowPool();

    created(...objs: SlowObject[]) {
        objs.forEach(storage.created);
    }

    updated(...objs: SlowObject[]) {
        objs.forEach(storage.updated);
    }

    deleted(...objs: SlowObject[]) {
        objs.forEach(storage.deleted);
    }
}
