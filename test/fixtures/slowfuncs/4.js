function fn(iters) {
    var c = 0;
    var setTimeout = 5;
    for (var i = 1; i <= iters; ++i) {
        __yield(square(i));
    }
    return 'done';
    function square(n) { return n * n; }
}
;
module.exports = fn;
//# sourceMappingURL=4.js.map