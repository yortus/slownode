import Types = require("event-loop");
import errors = require("./errors");
import createDatabase = require("./createDatabase");
import knex = require("knex");
import rowToTask = require("./toTask");
import taskToRow = require("./toRow");

class EventLoop implements Types.EventLoop {

	constructor(databaseName: string, pollingDelay: number) {
		if (typeof databaseName !== "string") throw new TypeError(errors.MustSupplyDbName);
		if (pollingDelay < 50) throw new Error(errors.InvalidPollDelay);
		
		this.store = knex({
			client: "sqlite3",
			connection: {
				filename: databaseName
			}
		});

		this.pollingDelay = pollingDelay;

		createDatabase(this.store)
			.then(() => this.flush());
	}

	store: knex;
	pollingDelay: number = 1000;
	taskHandlers: Types.TaskIndex = {};

	flush = () => {
		this.fetchNext()
			.then(this.runTask)
	};

	runTask = (task?: Types.EventTask) => {
		if (!task) {
			setTimeout(() => this.flush(), this.pollingDelay);
			return Promise.resolve(true);
		}

		var handler = this.getTaskHandler(task.topicFilter, task.functionId);
		if (!handler) throw new Error(errors.NoHandler);

		return handler.callback(task.task)
			.then(() => this.removeTask(task))
			.then(() => true)
	};

	fetchNext = () => {
		return this.store("tasks")
			.select()
			.where("runAt", "<=", Date.now())
			.orderBy("runAt", "asc")
			.orderBy("id", "asc")
			.limit(1)
			.then((rows: Types.TaskSchema) => this.toTask(rows[0]) || null);
	};

	addTaskHandler = (handler: Types.TaskHandler): boolean => {
		var taskHandler = this.getTaskHandler(handler.topicFilter, handler.functionId);

		if (!!taskHandler) throw new Error(errors.FunctionExists);

		if (!this.taskHandlers[handler.topicFilter]) this.taskHandlers[handler.topicFilter] = {};
		this.taskHandlers[handler.topicFilter][handler.functionId] = handler;

		return true;
	};

	removeTaskHandler = (topicFilter: string, functionId: string): boolean => {
		var topicTasks = this.taskHandlers[topicFilter] || {};

		var isExisting = !!topicTasks[functionId];
		if (!isExisting) return false;

		return delete this.taskHandlers[topicFilter][functionId];
	};

	getTaskHandler = (topicFilter: string, functionId: string) => {
		var topicTasks = this.taskHandlers[topicFilter] || {};
		return topicTasks[functionId];
	}

	removeTask = (task: Types.EventTask) => {
		return this.store("tasks")
			.delete()
			.where("id", "=", task.id);
	}
	
	addTask = (task: Types.EventTask) => {
		var row = this.toRow(task);
		return this.store("tasks")
			.insert(row);
	}

	toTask = rowToTask;
	toRow = taskToRow;
}
