
let s_sourcePath = "";

export function _source(path: string) { s_sourcePath = path;}

export function _output(value: any, line: number) {
    console.log(value, `(${s_sourcePath}:${line})`);
}

export function _assert(value: any, expected: any, line: number) {
    if (value != expected) {
        console.error(`expected ${expected}, got ${value} (${s_sourcePath}:${line})`);
    }
}