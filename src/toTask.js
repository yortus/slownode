function toTask(taskRow) {
    return {
        id: taskRow.id,
        topicFilter: taskRow.topicFilter,
        functionId: taskRow.functionId,
        task: JSON.parse(taskRow.task)
    };
}
module.exports = toTask;
//# sourceMappingURL=toTask.js.map