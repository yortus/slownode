var crypto = require('crypto');
function shasum(text) {
    var result = crypto.createHash('sha1').update(text).digest('hex').slice(0, 40);
    return result;
}
module.exports = shasum;
//# sourceMappingURL=shasum.js.map