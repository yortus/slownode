export = fn;


function fn(first, limit) {
    var result = [];

    outer:
    var i = 1;//first;
    while (true) {
        try {
            var j = 1 / (i - 10);//limit);
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
