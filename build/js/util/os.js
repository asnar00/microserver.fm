// ᕦ(ツ)ᕤ
// os.ts
// all server-side stuff encapsulated here; not feature modular
// just do one thing and do it well
// author: asnaroo
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as deno_http from "https://deno.land/std@0.165.0/http/server.ts";
import * as deno_file from "https://deno.land/std@0.165.0/http/file_server.ts";
export function serve(serveFn, options) {
    deno_http.serve(serveFn, { port: 8000 });
}
export function serve_file(req, path) {
    return __awaiter(this, void 0, void 0, function* () {
        return deno_file.serveFile(req, path);
    });
}
export function cwd() {
    return Deno.cwd();
}
export function readFile(path) {
    return Deno.readTextFileSync(path);
}
export function writeFile(path, content) {
    Deno.ensureDirSync(path);
    Deno.writeTextFileSync(path);
}
export function extension(path) {
    return "." + path.split('.').pop() || '';
}
