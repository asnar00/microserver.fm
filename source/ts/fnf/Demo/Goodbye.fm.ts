// ᕦ(ツ)ᕤ
// /ts/fnf/Demo/Goodbye.fm.ts
// created from /fnf/Demo/Goodbye.md
import { _Feature, feature, def, replace, on, after, before, struct, extend, make, fm } from "../../util/fm.js";
import { _Demo } from "../Demo.fm.js";

declare const goodbye: () => void;
declare const demo: () => void;

@feature export class _Goodbye extends _Demo { 
 
@def goodbye() { fm.log("kthxbye."); } 
@after demo() { goodbye(); } 

async _test() {
}
}
