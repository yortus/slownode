import Types = require("event-loop");
export = toRow;

function toRow(event: Types.Event): Types.EventSchema {
	return {
		runAt: Date.now(),
		runAtReadable: new Date().toISOString(),
		eventName: event.eventName,
		event: JSON.stringify(event.event)
	};
}