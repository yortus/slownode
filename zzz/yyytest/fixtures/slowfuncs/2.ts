declare var __yield;
export = fn;


function fn(iters: number, throwAfter: number) {
    for (var i = 1; i < iters; ++i) {
        if (i > throwAfter) throw 'bar';
        __yield('foo' + i * 10);
    }
};
