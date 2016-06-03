'use strict';
import ExtensibilityAPI from './extensibility-api';
export default Extension;





// TODO: ...
interface Extension {
    (api: ExtensibilityAPI): ExtensibilityAPI;
}
