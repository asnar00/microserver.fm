// ᕦ(ツ)ᕤ
// ./../ts/fnf/test.fm.ts.ts
// created from ./../fnf/test.fnf.md

import { _source, _output, _assert }  from "/Users/asnaroo/Desktop/experiments/microserver.fm/source/ts/util/test.js";

_source("./../fnf/test.fnf.md");

function main() { //@ 8
    console.log("hello world"); //@ 9
} //@ 10
main(); //@ 16
function add(a: number, b: number) : number { //@ 20
    return a + b; //@ 21
} //@ 22

export async function test_test() {
    _output(await add(10, 5), 26); //@ 26
    _assert(await add(10, 5), 15, 30); //@ 30
    _assert(await add(10, 5), 16, 34); //@ 34
}
