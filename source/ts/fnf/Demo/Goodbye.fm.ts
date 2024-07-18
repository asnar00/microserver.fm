// ᕦ(ツ)ᕤ
// /Users/asnaroo/Desktop/experiments/microserver.fm/source/ts/fnf/Demo/Goodbye.fm.ts
// created from /Users/asnaroo/Desktop/experiments/microserver.fm/source/fnf/Demo/Goodbye.md

import { _source, _output, _assert }  from "/Users/asnaroo/Desktop/experiments/microserver.fm/source/ts/util/test.js";

_source("/Users/asnaroo/Desktop/experiments/microserver.fm/source/fnf/Demo/Goodbye.md");

import { _Feature, feature, def, replace, on, after, before, struct, extend, make, fm } from "/Users/asnaroo/Desktop/experiments/microserver.fm/source/ts/util/fm.ts";
import { _Demo } from "../Demo.fm.js";

export declare const goodbye: () => void;
export declare const main: () => void;

@feature export class _Goodbye extends _Demo { //@ 6
@def goodbye() { fm.log("kthxbye."); } //@ 8
 //@ 9
@after main() { goodbye(); } //@ 10

async _test() {
}
}
