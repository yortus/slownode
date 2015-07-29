import Types = require("event-loop");
export = toRow;

function toRow(task: Types.Event): Types.TaskEventSchema
	return {
		runAt: Date.now(),
		runAtReadable: new Date().toISOString(),
		topicFilter: task.topicFilter,
		functionId: task.functionId,
		task: JSON.stringify(task.task)
	};
}