// ᕦ(ツ)ᕤ
// /Users/asnaroo/Desktop/experiments/microserver.fm/source/ts/fnf/Demo/Hello.fm.ts
// created from /Users/asnaroo/Desktop/experiments/microserver.fm/source/fnf/Demo/Hello.md
import { _Feature, feature, def, replace, on, after, before, struct, extend, make, fm } from "/Users/asnaroo/Desktop/experiments/microserver.fm/source/ts/util/fm.js";
import { _Demo } from "../Demo.fm.js";

export declare const hello: () => void;
export declare const main: () => void;

fm._source("/Users/asnaroo/Desktop/experiments/microserver.fm/source/fnf/_Demo/_Hello.md");
@feature export class _Hello extends _Demo { //@ 6
@on hello() { fm.log("hello world!"); } //@ 10
@on main() { hello(); } //@ 14

async _test() {
}
}
