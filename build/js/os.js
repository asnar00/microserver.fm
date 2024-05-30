// ᕦ(ツ)ᕤ
// os.ts
// all platform stuff encapsulated here
// author: asnaroo
import * as deno_http from "https://deno.land/std@0.165.0/http/server.ts";
import * as deno_file from "https://deno.land/std@0.165.0/http/file_server.ts";
export function serve(handler, options) {
    deno_http.serve(handler, { port: 8000 });
}
export async function serveFile(req, path) {
    return deno_file.serveFile(req, path);
}
export function cwd() {
    return Deno.cwd();
}
