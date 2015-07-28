import knex = require("knex");
export = create;

function create(db: knex) {
	return hasTable(db)
		.then(exists => createTable(db, exists))
}

function hasTable(db: knex) {
	return db.schema.hasTable("tasks");
}

function createTable(db: knex, exists: boolean) {
	if (exists) return Promise.resolve(true);

	return db.schema.table("tasks", table => {
		table.bigInteger("id").primary();
		table.bigInteger("runAt");
		table.text("runAtReadble");
		table.text("topicFilter");
		table.text("functionId");
		table.text("task");
	}).then(() => Promise.resolve(true));
}