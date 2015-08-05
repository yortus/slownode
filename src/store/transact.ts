import Promise = require("bluebird");
import SlowNode = require("../index");
import db = SlowNode.connection;
var QueryBuilder = db("");

function transact(queries: typeof QueryBuilder[]) {
	return db.transaction(trx => {
		
		queries.forEach(q => q.transacting(trx));
		
		return Promise.all(queries)
			.then(trx.commit)
			.catch(trx.commit);
	});
}
