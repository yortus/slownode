import Types = require("event-loop");
export = toTask;

function toTask(taskRow: Types.EventSchema): Types.Event {
	return {
		id: taskRow.id,
		topicFilter: taskRow.eventName,
		functionId: taskRow.subscriberId,
		task: JSON.parse(taskRow.task)
	};
}