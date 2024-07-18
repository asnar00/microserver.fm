// ᕦ(ツ)ᕤ
// /Users/asnaroo/Desktop/experiments/microserver.fm/source/ts/fnf/Demo/Countdown.fm.ts
// created from /Users/asnaroo/Desktop/experiments/microserver.fm/source/fnf/Demo/Countdown.md
import { _Feature, feature, def, replace, on, after, before, struct, extend, make, fm } from "/Users/asnaroo/Desktop/experiments/microserver.fm/source/ts/util/fm.js";
import { _Demo } from "../Demo.fm.js";

export declare const countdown: () => void;
export declare const main: () => void;

fm._source("/Users/asnaroo/Desktop/experiments/microserver.fm/source/fnf/_Demo/_Countdown.md");
@feature export class _Countdown extends _Demo { //@ 6
@on countdown() { fm.log("10 9 8 7 6 5 4 3 2 1"); } //@ 10
@before main() { countdown(); } //@ 14

async _test() {
}
}
