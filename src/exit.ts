import Promise = require("bluebird")
import fs = require("fs");
import db = require("./store/db");
var unlink = Promise.promisify(fs.unlink);
export = exit;

function exit() {
	return db.destroy()
		.then(() => unlink("slownode.db"))
		.then(() => true)
		.catch(() => false);
}
