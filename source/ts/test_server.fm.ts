// ᕦ(ツ)ᕤ
// test_server.fm.ts
// test the output of fnf.ts
// author: asnaroo

console.log("----------------------------------------------------------");
import { _Feature, feature, def, replace, on, after, before, fm } from "./util/fm.ts";
import * as ImportAll from "./import/all.ts";
import { DenoStdInternalError } from "https://deno.land/std@0.156.0/_util/assert.ts";
import * as os from "./util/os.ts";

ImportAll._import();

async function main() {
    await fm.init(Deno.args, os.cwd());
    console.log("----------------------------------------------------------");
    demo();
}

main();