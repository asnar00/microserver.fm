// ᕦ(ツ)ᕤ
// /Users/asnaroo/Desktop/experiments/microserver.fm/source/ts/fnf/Demo.fm.ts
// created from /Users/asnaroo/Desktop/experiments/microserver.fm/source/fnf/Demo.md

import { _source, _output, _assert }  from "/Users/asnaroo/Desktop/experiments/microserver.fm/source/ts/util/test.js";

_source("/Users/asnaroo/Desktop/experiments/microserver.fm/source/fnf/Demo.md");

import { _Feature, feature, def, replace, on, after, before, struct, extend, make, fm } from "/Users/asnaroo/Desktop/experiments/microserver.fm/source/ts/util/fm.ts";

export declare const main: () => void;

@feature export class _Demo extends _Feature { //@ 6
@replace main() { fm.log("nothing to see here"); } //@ 10
} //@ 14

export async function Demo_test() {
}
