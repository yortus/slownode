import crypto = require('crypto');
export = shasum;


function shasum(text: string): string {
    var result = crypto.createHash('sha1').update(text).digest('hex').slice(0, 40);
    return result;
}
