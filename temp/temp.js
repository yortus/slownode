define("b", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = { b: 2 };
});
define("a/b", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = { bb: 22 };
});
define("a", ["require", "exports", "b", "a/b"], function (require, exports, b_1, b_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = { a: 1, B: b_1.default, B2: b_2.default, c: 3 };
});
