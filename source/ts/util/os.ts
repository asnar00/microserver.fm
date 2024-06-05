// ᕦ(ツ)ᕤ
// os.ts
// all server-side stuff encapsulated here; not feature modular
// just do one thing and do it well
// author: asnaroo

import * as deno_http from "https://deno.land/std@0.165.0/http/server.ts";
import * as deno_file from "https://deno.land/std@0.165.0/http/file_server.ts";

export function serve(serveFn: Function, options: { port: number }) {
    deno_http.serve(serveFn, { port: 8000 });
}

export function cwd() {
    return Deno.cwd();
}

export function readFile(path: string): string {
    return Deno.readTextFileSync(path);
}

export function writeFile(path: string, content: string) {
    Deno.ensureDirSync(path);
    Deno.writeTextFileSync(path);
}

export function extension(path: string): string {
    return "." + path.split('.').pop() || '';
}


