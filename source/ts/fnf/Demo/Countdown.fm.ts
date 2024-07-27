// ᕦ(ツ)ᕤ
// /ts/fnf/Demo/Countdown.fm.ts
// created from /fnf/Demo/Countdown.md

import { _Feature, feature, def, replace, on, after, before, struct, extend, make, fm } from "../../util/fm.js";
import { _Demo } from "../Demo.fm.js";

export function _import() { console.log("Countdown._import()"); }

declare const countdown: () => void;
declare const demo: () => void;

@feature export class _Countdown extends _Demo { 
@def countdown() { console.log("10 9 8 7 6 5 4 3 2 1"); } 
@before async demo() { countdown(); } 

async _test() {
    fm._source("/fnf/Demo/Countdown.md");
}
}
