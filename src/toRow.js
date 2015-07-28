function toRow(task) {
    return {
        runAt: Date.now(),
        runAtReadable: new Date().toISOString(),
        topicFilter: task.topicFilter,
        functionId: task.functionId,
        task: JSON.stringify(task.task)
    };
}
module.exports = toRow;
//# sourceMappingURL=toRow.js.map