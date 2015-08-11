import store = require("../store/index");
import Types = require("slownode-prev");
export = immediate;

function immediate(func: () => any, options?: Types.SlowOptions) {
    options = options || {};
    options.runAt = 0;
    options.intervalMs = 0;

    return store
        .addTimedFunction({
            body: func,
            options: options
        });
}