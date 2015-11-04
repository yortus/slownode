function fn() {
    var limit = __const(1 + 2 + 3);
    var fs = require('fs');
    var exists = fs.existsSync('abc');
    for (var i = 0; i < limit; ++i) {
        __yield(i);
    }
}
;
module.exports = fn;
//# sourceMappingURL=3.js.map