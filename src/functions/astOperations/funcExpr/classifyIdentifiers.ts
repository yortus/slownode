import _ = require('lodash');
import matchNode = require('../matchNode');
import traverseTree = require('../traverseTree');
export = classifyIdentifiers;


// TODO: BUG (corner case): A reference to a free (ie non-local) identifier with the same name
//       as a catch block exception indentifier will be identified as referring to that catch ID,
//       even if the reference appears outside the catch block, which is materially incorrect.


// TODO: BUG: If funcExpr has inner function/lambdas, results will not make sense.


// TODO: what about arguments? Is that a local?

/**
 * Find all indentifiers referenced in the given function expression,
 * and classify them by scope. The results are memoized on the _id key.
 * NB: Duplicates are *not* removed.
 */
function classifyIdentifiers(funcExpr: ESTree.FunctionExpression) {

    // Return the previously computed result, if available.
    if (funcExpr._ids) return funcExpr._ids;

    // Find all locally-declared IDs, and all locally-referenced IDs.
    var varIds = funcExpr.params.map(p => <string> p['name']);
    var letIds: string[] = [];
    var constIds: string[] = [];
    var catchIds: string[] = [];
    var refIds: string[] = [];
    traverseTree(funcExpr.body, node => {
        return matchNode<any>(node, {

            // Collect locally-declared var/let/const IDs.
            VariableDeclaration: (stmt) => {
                var ids = stmt.declarations.map(decl => decl.id['name']);
                switch (stmt.kind) {
                    case 'var': varIds = varIds.concat(ids); break;
                    case 'let': letIds = letIds.concat(ids); break;
                    case 'const': constIds = constIds.concat(ids); break;
                }
                return { type: 'ArrayExpression', elements: stmt.declarations.filter(decl => !!decl.init).map(decl => decl.init) };
            },

            // Collect catch block exception identifiers.
            TryStatement: (stmt) => {
                if (stmt.handler) {
                    catchIds.push(stmt.handler.param['name']);
                }
            },

            // Collect all referenced IDs, excluding labels and property names.
            LabeledStatement: (stmt) => stmt.body,
            MemberExpression: (expr) => expr.computed ? void 0 : expr.object,
            ObjectExpression: (expr) => {
                var computedKeyExprs = expr.properties.filter(p => p.computed).map(p => p.key);
                var valueExprs = expr.properties.map(p => p.value);
                return { type: 'ArrayExpression', elements: computedKeyExprs.concat(valueExprs) };
            },
            Identifier: (expr) => { refIds.push(expr.name); },

            // For all other constructs, just continue traversing their children.
            Otherwise: (node) => { /* pass-through */ }
        });
    });

    // Extract global and scoped IDs from the collected refIDs.
    var moduleIds: string[] = [];
    var scopedIds: string[] = [];
    var globalIds: string[] = [];
    var allLocalIds = [].concat(varIds, letIds, constIds, catchIds);
    var allModuleIds = ['require', 'module', 'exports', '__filename', '__dirname'];
    refIds.forEach(refId => {
        if (allLocalIds.indexOf(refId) !== -1) return;
        (refId in global ? globalIds : allModuleIds.indexOf(refId) === -1 ? scopedIds : moduleIds).push(refId);
    });

    // Memoize and return the classified identifiers.
    return funcExpr._ids = {
        local: {
            var: varIds,
            let: letIds,
            const: constIds,
            catch: catchIds,
            all: <string[]> _.unique([].concat(varIds, letIds, constIds, catchIds))
        },
        module: moduleIds,
        scoped: scopedIds,
        global: globalIds,
    };
}
