

let s = `
    <foo bar="baz's">
        &nbsp;
        \r\n\r\n
    </foo>
`;

let i = 10;
while (i) {
    i = i - 1;
}

let a = {foo: 'FOO', bar: 'BAR', baz: undefined, self: null};
a.self = a;

let b;

let node = {
    $type: 'Identifier',
    'n.a.m.e.': ['FOO'],
    'a.copy': a
}
node['name'] = node['n.a.m.e.'];

let re = /^fo+o$/gm;

let $type = [
    null,
    true,
    false,
    42,
    '42\n',
    Infinity,
    {$type:444222},
    NaN,
    0,
    -0,
    undefined,
    undefined
];

await sleep(1);



print('starting...');
await sleep(1000);
print('after one second...');
await sleepThenFail(1000, 'oops!');
//throw 42;
print('...finished');
