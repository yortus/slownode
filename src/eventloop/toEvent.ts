import Types = require("slownode");
export = toEvent;

function toEvent(eventRow: Types.EventSchema): Types.SlowFunction {
	return {
		id: eventRow.id,
		functionId: eventRow.eventName,
		arguments: JSON.parse(eventRow.event),
		runAt: eventRow.runAt
	};
}