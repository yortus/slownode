import Types = require("event-loop");
export = toTask;

function toTask(taskRow: Types.TaskSchema): Types.EventTask {
	return {
		id: taskRow.id,
		topicFilter: taskRow.topicFilter,
		functionId: taskRow.functionId,
		task: JSON.parse(taskRow.task)
	};
}