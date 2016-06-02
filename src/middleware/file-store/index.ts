'use strict';
import {MiddlewareAPI} from 'slownode/middleware';
import FileStoreOptions from './file-store-options';





// TODO: ...
declare module 'slownode/middleware' {
    interface MiddlewareOptions {
        fileStore?: boolean|FileStoreOptions;
    }
}





// TODO: ...
export default function autoAwait(api: MiddlewareAPI, options: FileStoreOptions) {
}
