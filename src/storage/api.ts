export = API;


namespace API {
    export interface SlowObject {
        _slow: {
            type: string;
            id?: string|number;
            [other: string]: any;
        }
        [other: string]: any;
    }
}


interface API {

    init(): void;

    upsert(slowObj: API.SlowObject): void;

    remove(slowObj: API.SlowObject): void;

    // TODO: add `where` param (eg for event loop searching for what it can schedule)
    // TODO: this can be memoized. Should only use at startup time (and event loop??)
    // TODO; fix return value annotation!!!
    find(type: string, id?: string|number): any[];
}
