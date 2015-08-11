export = fn;


function fn(a, b) {
    var result = [];

    outer:
    var i = 1;
    while (true) {
        try {
            var j = 1 / (i - 10);
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
