




(function slowAsyncFunctionBody($) {
    $.pos = $.pos || '@start';
    $.local = $.local || {};
    $.temp = $.temp || {};
    $.error = $.error || { handler: '@fail' };
    $.finalizers = $.finalizers || {};
    $main:
        while (true) {
            try {
                switch ($.pos) {
                case '@start':
                case '@1':
                    $.local.first = $.arguments[0];
                    $.local.limit = $.arguments[1];
                    $.local.result = [];
                case '@outer-entry':
                    $.local.i = $.local.first;
                case '@outer-exit':
                case '@2':
                    $.temp.test = true;
                    $.pos = $.temp.test ? '@3' : '@4';
                    continue;
                case '@3':
                    $.temp.receiver = $.local.console;
                    $.temp.func = $.temp.receiver['log'];
                    $.temp.args = [];
                    $.temp.arg = $.local.i;
                    $.temp.args.push($.temp.arg);
                    $.temp.void = $.temp.func.apply($.temp.receiver, $.temp.args);
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
                    $.temp.receiver = $.local.result;
                    $.temp.func = $.temp.receiver['push'];
                    $.temp.args = [];
                    $.temp.obj = $.local.er;
                    $.temp.arg = $.temp.obj['message'];
                    $.temp.args.push($.temp.arg);
                    $.temp.void = $.temp.func.apply($.temp.receiver, $.temp.args);
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
                    $.temp.receiver = $.local.result;
                    $.temp.func = $.temp.receiver['push'];
                    $.temp.args = [];
                    $.temp.arg = $.local.i;
                    $.temp.args.push($.temp.arg);
                    $.temp.void = $.temp.func.apply($.temp.receiver, $.temp.args);
                    $.result = $.local.result;
                    $.pos = '@done';
                    continue;
                case '@done':
                    break $main;
                case '@fail':
                    '========== TODO ==========';
                case '@finalize':
                    $.pos = $.finalizers.pending.pop() || $.finalizers.afterward;
                    continue;
                }
            } catch (ex) {
                $.error.occurred = true;
                $.error.value = ex;
                $.pos = $.error.handler;
                continue;
            } finally {
            }
        }
    return $.result;
})
