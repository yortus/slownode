/** Performs a caller-defined operation on an ESTree node using pattern matching to choose the appropriate action. */
function matchNode(node, cases) {
    var func = cases[node.type] || cases.Otherwise;
    if (func)
        return func(node);
    throw new Error("match: no handler for node type '" + node.type + "'");
}
module.exports = matchNode;
//# sourceMappingURL=matchNode.js.map