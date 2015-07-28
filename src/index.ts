import Types = require("event-loop");
import errors = require("./errors");
import knex = require("knex");

class EventLoop implements Types.EventLoop {

	constructor(databaseName: string, pollingDelay: number) {
		this.store = knex({
			client: "sqlite3",
			connection: {
				filename: databaseName
			}
		});

		this.pollingDelay = pollingDelay;
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

	toTask(taskRow: Types.TaskSchema): Types.EventTask {
		return {
			id: taskRow.id,
			topicFilter: taskRow.topicFilter,
			functionId: taskRow.functionId,
			task: JSON.parse(taskRow.task)
		};
	}

	removeTask = (task: Types.EventTask) => {
		return this.store("tasks")
			.delete()
			.where("id", "=", task.id);
	}
}
