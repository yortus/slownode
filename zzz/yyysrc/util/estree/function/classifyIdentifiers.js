var _ = require('lodash');
var matchNode = require('../matchNode');
var traverseTree = require('../traverseTree');
// TODO: BUG (corner case): A reference to a free (ie non-local) identifier with the same name
//       as a catch block exception indentifier will be identified as referring to that catch ID,
//       even if the reference appears outside the catch block, which is materially incorrect.
// TODO: what about arguments? Is that a local?
/**
 * Find all indentifiers referenced in the given function expression,
 * and classify them by scope. The results are memoized on the _id key.
 * NB: Duplicates are *not* removed.
 */
function classifyIdentifiers(func) {
    // Return the previously computed result, if available.
    if (func._ids)
        return func._ids;
    // Find all locally-declared IDs, and all locally-referenced IDs.
    var selfIds = func.id && func.id.name ? [func.id.name] : [];
    var varIds = func.params.map(function (p) { return p['name']; });
    var letIds = [];
    var constIds = [];
    var catchIds = [];
    var refIds = [];
    traverseTree(func.body, function (node) {
        return matchNode(node, {
            // Collect locally-declared var/let/const IDs.
            VariableDeclaration: function (stmt) {
                var ids = stmt.declarations.map(function (decl) { return decl.id['name']; });
                switch (stmt.kind) {
                    case 'var':
                        varIds = varIds.concat(ids);
                        break;
                    case 'let':
                        letIds = letIds.concat(ids);
                        break;
                    case 'const':
                        constIds = constIds.concat(ids);
                        break;
                }
                return { type: 'ArrayExpression', elements: stmt.declarations.filter(function (decl) { return !!decl.init; }).map(function (decl) { return decl.init; }) };
            },
            // Collect catch block exception identifiers.
            TryStatement: function (stmt) {
                if (stmt.handler) {
                    catchIds.push(stmt.handler.param['name']);
                }
            },
            // Collect all referenced IDs, excluding labels and property names.
            LabeledStatement: function (stmt) { return stmt.body; },
            MemberExpression: function (expr) { return expr.computed ? void 0 : expr.object; },
            ObjectExpression: function (expr) {
                var computedKeyExprs = expr.properties.filter(function (p) { return p.computed; }).map(function (p) { return p.key; });
                var valueExprs = expr.properties.map(function (p) { return p.value; });
                return { type: 'ArrayExpression', elements: computedKeyExprs.concat(valueExprs) };
            },
            Identifier: function (expr) { refIds.push(expr.name); },
            // Skip over nested function declarations, capturing only their name when appropriate.
            // TODO: ensure name doesn't clash with another name??
            FunctionExpression: function (expr) { return false; },
            FunctionDeclaration: function (decl) {
                var name = decl.id && decl.id.name;
                if (name)
                    varIds.push(name);
                return false;
            },
            // For all other constructs, just continue traversing their children.
            Otherwise: function (node) { }
        });
    });
    // Extract global and scoped IDs from the collected refIDs.
    var moduleIds = [];
    var scopedIds = [];
    var globalIds = [];
    var allLocalIds = [].concat(selfIds, varIds, letIds, constIds, catchIds);
    var allModuleIds = ['require', 'module', 'exports', '__filename', '__dirname'];
    refIds.forEach(function (refId) {
        if (allLocalIds.indexOf(refId) !== -1)
            return;
        (refId in global ? globalIds : allModuleIds.indexOf(refId) === -1 ? scopedIds : moduleIds).push(refId);
    });
    // Memoize and return the classified identifiers.
    return func._ids = {
        local: {
            self: selfIds,
            var: varIds,
            let: letIds,
            const: constIds,
            catch: catchIds,
            all: _.unique([].concat(selfIds, varIds, letIds, constIds, catchIds))
        },
        module: moduleIds,
        scoped: scopedIds,
        global: globalIds,
    };
}
module.exports = classifyIdentifiers;
//# sourceMappingURL=classifyIdentifiers.js.map