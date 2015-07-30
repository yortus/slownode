import Types = require("slownode");
export = toRow;

function toRow(event: Types.SlowFunction): Types.EventSchema {
	return {
		runAt: Date.now(),
		runAtReadable: new Date().toISOString(),
		eventName: event.functionId,
		event: JSON.stringify(event.arguments)
	};
}