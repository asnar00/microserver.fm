// ᕦ(ツ)ᕤ
// /ts/fnf/Demo/Hello.fm.ts
// created from /fnf/Demo/Hello.md

import { _Feature, feature, def, replace, on, after, before, struct, extend, make, fm } from "../../util/fm.ts";
import { _Demo } from "../Demo.fm.ts";

export function _import() { console.log("Hello._import()"); }

declare const hello: () => void;
declare const demo: () => void;

@feature export class _Hello extends _Demo { 
@def hello() { console.log("hello world!"); } 
@replace demo() { hello(); } 

async _test() {
    fm._source("/fnf/Demo/Hello.md");
}
}
