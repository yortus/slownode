function fn(first, limit) {
    //var result = [];
    outer: var i = first;
    while (true) {
        try {
            var j = 1 / (i - limit);
            if (j === Infinity)
                throw new Error('stop');
        }
        catch (er) {
            //result.push(er.message);
            var YIELDED = __yield(er.message);
            break;
        }
        finally {
            ++i;
        }
    }
    //result.push(i);
    __yield(i);
    return 'done'; //result;
}
;
module.exports = fn;
//# sourceMappingURL=1.js.map