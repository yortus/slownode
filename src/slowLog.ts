import SlowObject = require('./slowObject');
import storage = require('./storage/storage');
export = SlowLog;


class SlowLog {

    static none = new SlowLog();

    created(...objs: SlowObject[]) {
        objs.forEach(storage.created);
    }

    updated(...objs: SlowObject[]) {
        objs.forEach(storage.updated);
    }

    deleted(...objs: SlowObject[]) {
        objs.forEach(storage.deleted);
    }

    saveChanges() {
// TODO: temp testing...
console.log('SAVE CHANGES');
        storage.saveChanges();
    }

}
