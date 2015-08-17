function fn(iters, throwAfter) {
    for (var i = 1; i < iters; ++i) {
        if (i > throwAfter)
            throw 'bar';
        __yield('foo' + i * 10);
    }
}
;
module.exports = fn;
//# sourceMappingURL=2.js.map