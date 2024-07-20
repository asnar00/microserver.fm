// ᕦ(ツ)ᕤ
// /Users/asnaroo/Desktop/experiments/microserver.fm/source/ts/fnf/Demo/Goodbye.fm.ts
// created from /Users/asnaroo/Desktop/experiments/microserver.fm/source/fnf/Demo/Goodbye.md
/// <reference path="/Users/asnaroo/Desktop/experiments/microserver.fm/source/ts/fnf/all.d.ts" />
import { _Feature, feature, def, replace, on, after, before, struct, extend, make, fm } from "/Users/asnaroo/Desktop/experiments/microserver.fm/source/ts/util/fm.js";
import { _Demo } from "../Demo.fm.js";

fm._source("/Users/asnaroo/Desktop/experiments/microserver.fm/source/fnf/_Demo/_Goodbye.md");
@feature export class _Goodbye extends _Demo { //@ 6
@def goodbye() { fm.log("kthxbye."); } //@ 8
 //@ 9
@after demo() { goodbye(); } //@ 10

async _test() {
}
}
