'use strict';
import Interpreter from '../../jasm/interpreter';
export default RuntimePlugin;





interface RuntimePlugin {
    (opts?: void): {
        globalFactory?: () => {};
        step?: (jasm: Interpreter) => boolean|Promise<boolean>;
    };
};
