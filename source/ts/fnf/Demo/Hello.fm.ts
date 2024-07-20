// ᕦ(ツ)ᕤ
// /Users/asnaroo/Desktop/experiments/microserver.fm/source/ts/fnf/Demo/Hello.fm.ts
// created from /Users/asnaroo/Desktop/experiments/microserver.fm/source/fnf/Demo/Hello.md
/// <reference path="/Users/asnaroo/Desktop/experiments/microserver.fm/source/ts/fnf/all.d.ts" />
import { _Feature, feature, def, replace, on, after, before, struct, extend, make, fm } from "/Users/asnaroo/Desktop/experiments/microserver.fm/source/ts/util/fm.js";
import { _Demo } from "../Demo.fm.js";

fm._source("/Users/asnaroo/Desktop/experiments/microserver.fm/source/fnf/_Demo/_Hello.md");
@feature export class _Hello extends _Demo { //@ 6
@on hello() { fm.log("hello world!"); } //@ 10
@on demo() { hello(); } //@ 14

async _test() {
}
}
