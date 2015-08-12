export = fn;


function fn(first, limit) {
    var result = [];

    outer:
    var i = first;
    while (true) {
        try {
            var j = 1 / (i - limit);
            if (j === Infinity) throw new Error('stop');
        }
        catch (er) {
            result.push(er.message);
            break;
        }
        finally {
            ++i;
        }
    }
    result.push(i);
    return result;
}
