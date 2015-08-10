var async = require('asyncawait/async');
var await = require('asyncawait/await');
var slow = require('slownode');
var fn = async(function () {
    await(slow.stop());
});
fn();
//# sourceMappingURL=main.js.map