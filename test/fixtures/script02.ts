

print('starting...');
let i = 1;
while (i <= 10) {
    print(`${i} of 10...`)
    await sleep(1000);
    i = i + 1;
}
print('...finished');
