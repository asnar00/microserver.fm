// ᕦ(ツ)ᕤ
// /Users/asnaroo/Desktop/experiments/microserver.fm/source/ts/fnf/test.fm.ts
// created from /Users/asnaroo/Desktop/experiments/microserver.fm/source/fnf/test.md
import { _source, _output, _assert } from "/Users/asnaroo/Desktop/experiments/microserver.fm/source/ts/util/test.js";
_source("/Users/asnaroo/Desktop/experiments/microserver.fm/source/fnf/test.md");
function main() {
    console.log("hello world"); //@ 9
} //@ 10
main(); //@ 16
function add(a, b) {
    return a + b; //@ 21
} //@ 22
export async function test_test() {
    _output(await add(10, 5), 26); //@ 26
    _assert(await add(10, 5), 15, 30); //@ 30
    _assert(await add(10, 5), 16, 34); //@ 34
}
//# sourceMappingURL=test.fm.js.map