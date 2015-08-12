




function slowAsyncFunctionBody(a, b) {
    var $state, $pos, $error, $finalizers, $result;
    $state = { locals: {} }, $pos = '@start', $error = { handler: '@fail' }, $finalizers = {};
    $main:
        while (true) {
            try {
                switch ($pos) {
                case '@start':
                case '@1':
                    $state.locals.result = [];
                case '@outer-entry':
                    $state.locals.i = 1;
                case '@outer-exit':
                case '@2':
                    $state.test = true;
                    $pos = $state.test ? '@3' : '@4';
                    continue;
                case '@3':
                    $error.handler = '@5';
                    $error.occurred = false;
                    $state.lhs = 1;
                    $state.lhs1 = $state.locals.i;
                    $state.rhs1 = 10;
                    $state.rhs = $state.lhs1 - $state.rhs1;
                    $state.locals.j = $state.lhs / $state.rhs;
                    $state.lhs = $state.locals.j;
                    $state.rhs = Infinity;
                    $state.test = $state.lhs === $state.rhs;
                    $pos = $state.test ? '@10' : '@11';
                    continue;
                case '@10':
                    $state.func = Error;
                    $state.args = [];
                    $state.arg1 = 'stop';
                    $state.args.push($state.arg1);
                    $state.arg = Object.create($state.func.prototype);
                    $state.arg = $state.func.apply($state.arg, $state.args) || $state.arg;
                    throw $state.arg;
                    $pos = '@12';
                    continue;
                case '@11':
                case '@12':
                case '@5':
                    $error.handler = '@fail';
                    $pos = $error.occurred ? '@6' : '@7';
                    continue;
                case '@6':
                    $state.locals.er = $error.value;
                    $state.receiver = $state.locals.result;
                    $state.func = $state.receiver['push'];
                    $state.args = [];
                    $state.obj = $state.locals.er;
                    $state.arg = $state.obj['message'];
                    $state.args.push($state.arg);
                    $state.void = $state.func.apply($state.receiver, $state.args);
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
                    $state.void = ++$state.locals.i;
                    $pos = '@finalize';
                    continue;
                case '@9':
                    $pos = '@2';
                    continue;
                case '@4':
                    $state.receiver = $state.locals.result;
                    $state.func = $state.receiver['push'];
                    $state.args = [];
                    $state.arg = $state.locals.i;
                    $state.args.push($state.arg);
                    $state.void = $state.func.apply($state.receiver, $state.args);
                    $result = $state.locals.result;
                    $pos = '@done';
                    continue;
                case '@done':
                    break $main;
                case '@fail':
                    '========== TODO ==========';
                case '@finalize':
                    $pos = $finalizers.pending.pop() || $finalizers.afterward;
                    continue;
                }
            } catch (ex) {
                $error.occurred = true;
                $error.value = ex;
                $pos = $error.handler;
                continue;
            } finally {
            }
        }
    return $result;
}
