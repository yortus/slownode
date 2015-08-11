var slowfunc = require('./slowfunc');
function prepareExports(exports) {
    exports.default = {};
    // TODO: run the old and the new to compare results...
    var modified = slowfunc(original);
    var str = modified.toString();
    console.log('\n\n==================== ORIGINAL ====================');
    original(5, 7);
    console.log('\n\n==================== MODIFIED ====================');
    mod(5, 7);
    modified(5, 7);
}
exports.prepareExports = prepareExports;
function original(a, b) {
    outer: var i = 1;
    while (true) {
        try {
            var j = 1 / (i - 10);
            if (j === Infinity)
                throw new Error('stop');
        }
        catch (er) {
            console.log(er.message);
            break;
        }
        finally {
            ++i;
        }
    }
    console.log("i = " + i);
}
function mod(a, b) {
    var $pos, $result, $error, $finalizers, a, b, i, $test, j, $lhs, $rhs, $lhs2, $rhs2, $arg, $func, $args, $arg2, er, $void, $obj, $key;
    $pos = '@start', $error = { handler: '@fail' }, $finalizers = {};
    $main: while (true) {
        try {
            switch ($pos) {
                case '@start':
                case '@1':
                case '@outer-entry':
                    i = 1;
                case '@outer-exit':
                case '@2':
                    $test = true;
                    $pos = $test ? '@3' : '@4';
                    continue;
                case '@3':
                    $error.handler = '@5';
                    $error.occurred = false;
                    $lhs = 1;
                    $lhs2 = i;
                    $rhs2 = 10;
                    $rhs = $lhs2 - $rhs2;
                    j = $lhs / $rhs;
                    $lhs = j;
                    $rhs = Infinity;
                    $test = $lhs === $rhs;
                    $pos = $test ? '@10' : '@11';
                    continue;
                case '@10':
                    $func = Error;
                    $args = [];
                    $arg2 = 'stop';
                    $args.push($arg2);
                    $arg = Object.create($func.prototype);
                    $arg = $func.apply($arg, $args) || $arg;
                    throw $arg;
                    $pos = '@12';
                    continue;
                case '@11':
                case '@12':
                case '@5':
                    $error.handler = '@fail';
                    $pos = $error.occurred ? '@6' : '@7';
                    continue;
                case '@6':
                    er = $error.value;
                    $obj = console;
                    $func = $obj['log'];
                    $args = [];
                    $obj = er;
                    $arg = $obj['message'];
                    $args.push($arg);
                    $void = $func.apply($func, $args);
                    $finalizers.pending = ['@8'];
                    $finalizers.afterward = '@4';
                    $pos = '@finalize';
                    continue;
                case '@7':
                    $finalizers.pending = ['@8'];
                    $finalizers.afterward = '@9';
                    $pos = '@finalize';
                    continue;
                case '@8':
                    $error.handler = '@fail';
                    $void = ++i;
                    $pos = '@finalize';
                    continue;
                case '@9':
                    $pos = '@2';
                    continue;
                case '@4':
                    $obj = console;
                    $func = $obj['log'];
                    $args = [];
                    $lhs = 'i = ';
                    $rhs = i;
                    $arg = $lhs + $rhs;
                    $args.push($arg);
                    $void = $func.apply($func, $args);
                case '@done':
                    break $main;
                case '@fail':
                    $ = '========== TODO ==========';
                case '@finalize':
                    $pos = $finalizers.pending.pop() || $finalizers.afterward;
                    continue;
            }
        }
        catch (ex) {
            $error.occurred = true;
            $error.value = ex;
            $pos = $error.handler;
            continue;
        }
        finally {
        }
    }
    return $result;
}
//# sourceMappingURL=index.js.map