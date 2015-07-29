import Types = require("slownode");
export = toEvent;

function toEvent(eventRow: Types.EventSchema): Types.Event {
	return {
		id: eventRow.id,
		eventName: eventRow.eventName,
		event: JSON.parse(eventRow.event),
		runAt: eventRow.runAt
	};
}