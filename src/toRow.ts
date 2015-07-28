import Types = require("event-loop");
export = toRow;

function toRow(task: Types.EventTask): Types.TaskSchema {
	return {
		runAt: Date.now(),
		runAtReadable: new Date().toISOString(),
		topicFilter: task.topicFilter,
		functionId: task.functionId,
		task: JSON.stringify(task.task)
	};
}