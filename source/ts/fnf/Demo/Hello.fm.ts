// ᕦ(ツ)ᕤ
// /ts/fnf/Demo/Hello.fm.ts
// created from /fnf/Demo/Hello.md
import { _Feature, feature, def, replace, on, after, before, struct, extend, make, fm } from "../../util/fm.js";
import { _Demo } from "../Demo.fm.js";

declare const hello: () => void;
declare const demo: () => void;

@feature export class _Hello extends _Demo { 
@def hello() { fm.log("hello world!"); } 
@on demo() { hello(); } 

async _test() {
}
}
