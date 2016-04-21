

var i = 0;

while (i < 3) {
    ++i;
}

while (asyncTest(i)) {
    asyncBody(i);
}


function asyncTest(i) {/***/}
function asyncBody(i) {/***/}

// async function main() {
//     await 5;
// }
