export = API;


type Key = string|number;


interface API {

    init(): void;

    add(tableName: string, value: any, key?: Key): Key;

    get(tableName: string, key: Key): any;

    set(tableName: string, key: Key, value: any): void;

    del(tableName: string, key: Key): void;

    // TODO: add `where` param (eg for event loop searching for what it can schedule)
    find(tableName: string): { id: Key, value: any }[];
}
