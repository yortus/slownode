function toEvent(eventRow) {
    return {
        id: eventRow.id,
        eventName: eventRow.eventName,
        event: JSON.parse(eventRow.event),
        runAt: eventRow.runAt
    };
}
module.exports = toEvent;
//# sourceMappingURL=toEvent.js.map