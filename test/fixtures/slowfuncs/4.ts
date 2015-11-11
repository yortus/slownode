declare var __yield;
export = fn;


function fn(iters: number) {

    for (var i = 1; i <= iters; ++i) {
        __yield(square(i));
    }
    return 'done';

    function square(n) { return n * n; }
};
