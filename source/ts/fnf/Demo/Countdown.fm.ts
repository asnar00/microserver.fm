// ᕦ(ツ)ᕤ
// /ts/fnf/Demo/Countdown.fm.ts
// created from /fnf/Demo/Countdown.md

import { _Feature, feature, def, replace, on, after, before, struct, extend, make, fm } from "../../util/fm.ts";
import { _Demo } from "../Demo.fm.ts";

export function _import() { }

declare const countdown: () => void;
declare const demo: () => void;

@feature export class _Countdown extends _Demo { 
@def countdown() { fm.log("10 9 8 7 6 5 4 3 2 1"); } 
@before demo() { countdown(); } 

async _test() {
    fm._source("/fnf/Demo/Countdown.md");
}
}
