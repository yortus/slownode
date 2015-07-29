function toTask(taskRow) {
    return {
        id: taskRow.id,
        topicFilter: taskRow.eventName,
        functionId: taskRow.subscriberId,
        task: JSON.parse(taskRow.task)
    };
}
module.exports = toTask;
//# sourceMappingURL=toTask.js.map