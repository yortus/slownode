declare var __yield, __const;
declare var abc;
export = fn;


function fn() {
    var limit = __const(1+2+3);
    var fs = require('fs');
    var exists = fs.existsSync('abc');
    for (var i = 0; i < limit; ++i) {
        __yield (i);
    }
};
