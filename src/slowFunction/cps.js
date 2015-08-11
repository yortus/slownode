function cps(funcId) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var length = args.length;
    if (length < 2)
        throw new Error("more args needed");
}
module.exports = cps;
//# sourceMappingURL=cps.js.map