// ᕦ(ツ)ᕤ
// test_server.fm.ts
// test the output of fnf.ts
// author: asnaroo

console.log("----------------------------------------------------------");
import { _Feature, feature, def, replace, on, after, before, fm } from "./util/fm.js";
import * as _Demo from "./import/Demo.fm.js";
import "../../build/fnf/declarations.d.ts";

_Demo._import();

async function main() {
    console.log("----------------------------------------------------------");
    await demo();
}

main();