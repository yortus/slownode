function toEvent(eventRow) {
    return {
        id: eventRow.id,
        functionId: eventRow.eventName,
        arguments: JSON.parse(eventRow.event),
        runAt: eventRow.runAt
    };
}
module.exports = toEvent;
//# sourceMappingURL=toEvent.js.map