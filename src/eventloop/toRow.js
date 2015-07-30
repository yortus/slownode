function toRow(event) {
    return {
        runAt: Date.now(),
        runAtReadable: new Date().toISOString(),
        eventName: event.functionId,
        event: JSON.stringify(event.arguments)
    };
}
module.exports = toRow;
//# sourceMappingURL=toRow.js.map