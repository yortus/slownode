(function slowRoutineBody($) {
    $.pos = $.pos || '@start';
    $.local = $.local || {};
    $.temp = $.temp || {};
    $.error = $.error || { handler: '@fail' };
    $.finalizers = $.finalizers || { pending: [] };
    $.incoming = $.incoming || { type: 'yield' };
    $.outgoing = $.outgoing || { type: 'return' };
    while (true) {
        try {
            switch ($.pos) {
                case '@start':
                case '@1':
                    $.local.first = $.local.arguments[0];
                    $.local.limit = $.local.arguments[1];
                case '@outer-entry':
                    $.local.i = $.local.first;
                case '@outer-exit':
                case '@2':
                    $.temp.test = true;
                    $.pos = $.temp.test ? '@3' : '@4';
                    continue;
                case '@3':
                    $.error.handler = '@5';
                    $.error.occurred = false;
                    $.temp.lhs = 1;
                    $.temp.lhs1 = $.local.i;
                    $.temp.rhs1 = $.local.limit;
                    $.temp.rhs = $.temp.lhs1 - $.temp.rhs1;
                    $.local.j = $.temp.lhs / $.temp.rhs;
                    $.temp.lhs = $.local.j;
                    $.temp.rhs = Infinity;
                    $.temp.test = $.temp.lhs === $.temp.rhs;
                    $.pos = $.temp.test ? '@10' : '@11';
                    continue;
                case '@10':
                    $.temp.func = Error;
                    $.temp.args = [];
                    $.temp.arg1 = 'stop';
                    $.temp.args.push($.temp.arg1);
                    $.temp.arg = Object.create($.temp.func.prototype);
                    $.temp.arg = $.temp.func.apply($.temp.arg, $.temp.args) || $.temp.arg;
                    throw $.temp.arg;
                    $.pos = '@12';
                    continue;
                case '@11':
                case '@12':
                case '@5':
                    $.error.handler = '@fail';
                    $.pos = $.error.occurred ? '@6' : '@7';
                    continue;
                case '@6':
                    $.local.er = $.error.value;
                    $.outgoing.type = 'yield';
                    $.temp.obj = $.local.er;
                    $.outgoing.value = $.temp.obj['message'];
                    $.pos = '@13';
                    return;
                case '@13':
                    $.pos = {
                        yield: '@14',
                        throw: '@15',
                        return: '@16'
                    }[$.incoming.type];
                    continue;
                case '@15':
                    throw $.incoming.value;
                case '@16':
                    $.outgoing.value = $.incoming.value;
                    $.finalizers.pending = ['@8'];
                    $.finalizers.afterward = '@done';
                    $.pos = '@finalize';
                    continue;
                case '@14':
                    $.local.YIELDED = $.incoming.value;
                    $.finalizers.pending = ['@8'];
                    $.finalizers.afterward = '@4';
                    $.pos = '@finalize';
                    continue;
                case '@7':
                    $.finalizers.pending = ['@8'];
                    $.finalizers.afterward = '@9';
                    $.pos = '@finalize';
                    continue;
                case '@8':
                    $.error.handler = '@fail';
                    $.temp.void = ++$.local.i;
                    $.pos = '@finalize';
                    continue;
                case '@9':
                    $.pos = '@2';
                    continue;
                case '@4':
                    $.outgoing.type = 'yield';
                    $.outgoing.value = $.local.i;
                    $.pos = '@17';
                    return;
                case '@17':
                    $.pos = {
                        yield: '@18',
                        throw: '@19',
                        return: '@20'
                    }[$.incoming.type];
                    continue;
                case '@19':
                    throw $.incoming.value;
                case '@20':
                    $.outgoing.value = $.incoming.value;
                    $.pos = '@done';
                    continue;
                case '@18':
                    $.temp.void = $.incoming.value;
                    $.outgoing.value = 'done';
                    $.pos = '@done';
                    continue;
                case '@done':
                    $.outgoing.type = 'return';
                    return;
                case '@fail':
                    $.outgoing.type = 'throw';
                    $.outgoing.value = $.error.value;
                    return;
                case '@finalize':
                    $.pos = $.finalizers.pending.pop() || $.finalizers.afterward;
                    continue;
            }
        }
        catch (ex) {
            $.error.occurred = true;
            $.error.value = ex;
            $.pos = $.error.handler;
            continue;
        }
    }
});
//# sourceMappingURL=1.slow.js.map