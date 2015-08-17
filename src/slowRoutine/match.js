/** Performs a caller-defined operation on an ESTree node using pattern matching to choose the appropriate action. */
function match(node, match) {
    var func = match[node.type] || match.Otherwise;
    if (func)
        return func(node);
    throw new Error("match: no handler for node type '" + node.type + "'");
}
module.exports = match;
//# sourceMappingURL=match.js.map