import Types = require("event-loop");
import errors = require("./errors");
import createDatabase = require("./createDatabase");
import Knex = require("knex");
import rowToTask = require("./toTask");
import taskToRow = require("./toRow");
export = EventLoop;

class EventLoop implements Types.EventLoop {

	constructor(databaseName: string, pollingDelay: number) {
		if (typeof databaseName !== "string") throw new TypeError(errors.InvalidDatabaseName);
		if (databaseName.length < 1) throw new TypeError(errors.InvalidDatabaseName);
		if (typeof pollingDelay !== "number") throw new TypeError(errors.MustBeNumber);
		if (pollingDelay < 50) throw new Error(errors.InvalidPollDelay);
		if (pollingDelay === Infinity) throw new Error(errors.NotInfinity)

		databaseName += ".db";
		this.store = Knex({
			client: "sqlite3",
			connection: {
				filename: databaseName
			}
		});

		this.pollingDelay = pollingDelay;

		this.ready = createDatabase(this.store)
			.then(() => this.flush())			
	}

	store: Knex;
	pollingDelay: number = 1000;
	taskHandlers: Types.TaskIndex = {};
	ready: Promise<boolean>;
	flushCallback: any;
	
	stop = () => {
		if (this.flushCallback) clearTimeout(this.flushCallback);
	} 
	
	flush = () => {
		this.fetchNext()
			.then(this.runTask)
		return true;
	};	

	fetchNext = () => {
		return this.store("tasks")
			.select()
			.where("runAt", "<=", Date.now())
			.orderBy("runAt", "asc")
			.orderBy("id", "asc")
			.limit(1)
			.then((rows: Types.TaskSchema[]) => rows.length > 0 ? this.toTask(rows[0]) : null);
	};
	
	/**
	 * Handler operations
	 */

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
	
	/**
	 * Task operations
	 */
	runTask = (task?: Types.EventTask) => {
		if (!task) {
			this.flushCallback = setTimeout(() => this.flush(), this.pollingDelay);
			return Promise.resolve(true);
		}

		var handler = this.getTaskHandler(task.topicFilter, task.functionId);
		if (!handler) throw new Error(errors.NoHandler);

		return handler.callback(task.task)
			.then(() => this.removeTask(task))
			.then(() => true)
	};

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
