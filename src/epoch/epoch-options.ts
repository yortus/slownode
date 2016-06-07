'use strict';
export default EpochOptions;





// TODO: ...
interface EpochOptions {

    // TODO: ...
    storage?: FileStorageOptions; // TODO: Add others to union later...

    // TODO: ...
    createGlobal?: () => {};

    // Custom serializer for saving running script state
    replacer?: (this: any, key: string|number, val: any) => any;

    // Custom deserializer for loading running script state
    reviver?: (this: any, key: string|number, val: any) => any;

    // TODO: add type-checking support later (custom lib.d.ts, etc)...
}





// TODO: ...
export interface FileStorageOptions {
    type: 'file';
    dirname: string;
}
