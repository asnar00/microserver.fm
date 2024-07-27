// ᕦ(ツ)ᕤ
// /ts/fnf/Demo.fm.ts
// created from /fnf/Demo.md

import { _Feature, feature, def, replace, on, after, before, struct, extend, make, fm } from "../util/fm.js";

export function _import() { console.log("Demo._import()"); }

declare const demo: () => void;

@feature export class _Demo extends _Feature { 
@def async demo() { console.log("ᕦ(ツ)ᕤ"); } 

async _test() {
    fm._source("/fnf/Demo.md");
    fm._assert(await await demo(), undefined, 15); 
}
}
