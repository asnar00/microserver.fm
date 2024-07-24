// ᕦ(ツ)ᕤ
// /ts/fnf/test.fm.ts
// created from /fnf/test.md
import { fm } from "../util/fm.js";
function main() {
    console.log("hello world");
}
main();
function add(a, b) {
    return a + b;
}
export async function test_test() {
    fm._output(await add(10, 5), 26);
    fm._assert(await add(10, 5), 15, 30);
    fm._assert(await add(10, 5), 16, 34);
}
//# sourceMappingURL=test.fm.js.map