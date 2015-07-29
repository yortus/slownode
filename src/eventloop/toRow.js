function toRow(event) {
    return {
        runAt: Date.now(),
        runAtReadable: new Date().toISOString(),
        eventName: event.eventName,
        event: JSON.stringify(event.event)
    };
}
module.exports = toRow;
//# sourceMappingURL=toRow.js.map