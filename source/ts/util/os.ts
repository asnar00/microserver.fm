// ᕦ(ツ)ᕤ
// os.ts
// all server-side stuff encapsulated here; not feature modular
// just do one thing and do it well
// author: asnaroo

import * as deno_http from "https://deno.land/std@0.165.0/http/server.ts";
import * as deno_file from "https://deno.land/std@0.165.0/http/file_server.ts";

export function serve(handler: Function, options: { port: number }) {
    deno_http.serve(handler, { port: 8000 });
}

export async function serve_file(req: Request, path: string) : Promise<Response> {
    return deno_file.serveFile(req, path); 
}

export function cwd() {
    return Deno.cwd();
}

export function readFile(path: string): string {
    return deno_file.readTextFileSync(path);
}

export function writeFile(path: string, content: string) {
    deno_file.ensureDirSync(path);
    deno_file.writeTextFileSync(path);
}