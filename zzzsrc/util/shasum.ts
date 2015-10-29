import crypto = require('crypto');
export = shasum;


/**
 * Returns the SHA1 digest of the given string as a 40 character hex string.
 * @param text the string to be hashed.
 */
function shasum(text: string): string {
    var result = crypto.createHash('sha1').update(text).digest('hex').slice(0, 40);
    return result;
}
