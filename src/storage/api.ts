export = API;


namespace API {

    export type Key = string|number;

    export interface Record {
        type: string;
        id?: string|number;
        [other: string]: any;
    }
}


interface API {

    init(): void;

    insert(record: API.Record): API.Key;

    upsert(record: API.Record): API.Key;

    update(record: API.Record): void;

    remove(record: API.Record): void;

    // TODO: add `where` param (eg for event loop searching for what it can schedule)
    // TODO: this can be memoized. Should only use at startup time (and event loop??)
    find(record: API.Record): API.Record[];
}
