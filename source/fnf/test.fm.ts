// ᕦ(ツ)ᕤ
// test.ts
// created from /Users/asnaroo/Desktop/experiments/microserver.fm/source/fnf/test.fnf.md

function main() { //@ 8
    console.log("hello world"); //@ 9
} //@ 10
main(); //@ 16
function add(a: number, b: number) : number { //@ 20
    return a + b; //@ 21
} //@ 22
 //@ undefined
async function test_test() {
    _output(await add(10, 5), "/Users/asnaroo/Desktop/experiments/microserver.fm/source/fnf/test.fnf.md:26);" //@ 26
    _assert(await add(10, 5), 15, "/Users/asnaroo/Desktop/experiments/microserver.fm/source/fnf/test.fnf.md:30);" //@ 30
    _assert(await add(10, 5), 16, "/Users/asnaroo/Desktop/experiments/microserver.fm/source/fnf/test.fnf.md:34);" //@ 34
 //@ undefined}
