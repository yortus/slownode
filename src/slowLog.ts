import SlowObject = require('./slowObject');
import storage = require('./storage/storage');
export = SlowLog;


class SlowLog {

    static none = new SlowLog();

    created(...objs: SlowObject[]) {
// TODO: ...
console.log('CREATE');
        objs.forEach(storage.created);
    }

    updated(...objs: SlowObject[]) {
// TODO: ...
console.log('UPDATE');
        objs.forEach(storage.updated);
    }

    deleted(...objs: SlowObject[]) {
// TODO: ...
console.log('DELETE');
        objs.forEach(storage.deleted);
    }
}
