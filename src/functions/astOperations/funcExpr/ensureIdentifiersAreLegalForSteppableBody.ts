import _ = require('lodash');
import matchNode = require('../matchNode');
import traverseTree = require('../traverseTree');
import classifyIdentifiers = require('./classifyIdentifiers');
export = ensureIdentifiersAreLegalForSteppableBody;


/**
 * Traverses the AST and throws an error if an identifier is not considered legal in a Steppable body. A legal identifier:
 * - must not have the name '$'.
 * - must not contain exotic characters (ie any character other than a-z, A-Z, 0-9, $, and _).
 * - must refer either to a local or a global variable (ie no references to ids in the function's lexical scope / no closures).
 * - must not be block-scoped (ie let vars; const and catch vars are treated specially and are hence allowed).
 */
function ensureIdentifiersAreLegalForSteppableBody(funcExpr: ESTree.FunctionExpression) {

    var ids = classifyIdentifiers(funcExpr);

    // Disallow 'let'-declared local identifiers.
    if (ids.let.length > 0) {
        throw new Error(`Steppable: block scoped variables are not allowed within the steppable body ('${ids.let.join("', '")}')`);
    }

    // Disallow scoped non-local identifiers (ie anything other than locals and globals).
    if (ids.freeScoped.length > 0) {
        throw new Error(`Steppable: variables that are neither local nor global are not allowed within the steppable body ('${ids.freeScoped.join("', '")}')`);
    }

    // Disallow '$' and exotic names.
    var legalNameRegex = /^(?!\$$)[a-zA-Z$_][a-zA-Z$_0-9]*$/;
    var allIds = _.unique([].concat(ids.var, ids.const, ids.catch, ids.freeGlobal));
    var badNames = allIds.filter(id => !legalNameRegex.test(id));
    if (badNames.length > 0) {
        throw new Error(`Steppable: invalid or disallowed identifier name(s): '${badNames.join("', '")}')`);
    }
}
