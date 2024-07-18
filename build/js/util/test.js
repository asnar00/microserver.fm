let s_sourcePath = "";
export function _source(path) { s_sourcePath = path; }
export function _output(value, line) {
    console.log(value, `(${s_sourcePath}:${line})`);
}
export function _assert(value, expected, line) {
    if (value != expected) {
        console.error(`expected ${expected}, got ${value} (${s_sourcePath}:${line})`);
    }
}
//# sourceMappingURL=test.js.map