function evalInContext(source, context) {
    // TODO: this won't work in strict mode. Will need to do it another way eventually (ie using 'eval' but not 'with')...
    // TODO: use 'vm' module
    var result;
    eval("with (context) result = (" + source + ");");
    return result;
}
module.exports = evalInContext;
//# sourceMappingURL=evalInContext.js.map