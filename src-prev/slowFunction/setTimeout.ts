import Types = require("slownode-prev");
import store = require("../store/index");
export = timeout;

function timeout(func: () => any, delayMs: number, options?: Types.SlowOptions): Promise<string> {
    options = options || {};
    options.intervalMs = 0;
    options.runAt = Date.now() + delayMs;

    return store
        .addTimedFunction({
            body: func,
            options: options
        });
}