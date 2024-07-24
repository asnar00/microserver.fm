// ᕦ(ツ)ᕤ
// server.fm.ts
// feature-modular server
// author: asnaroo

import * as os from "./util/os.js";
import { _Feature, feature, def, replace, on, after, before, fm } from "./util/fm.js";
import * as shared from "./shared.fm.js";

//------------------------------------------------------------------------------
// Server listens on port 8000 but only returns "not found" for now

declare const not_found: () => Promise<Response>;
declare const handle_request: (req: Request) => Promise<Response|undefined>;
declare const receive_request: (req: Request) => Promise<Response>;
declare const start_server: () => Promise<void>;

@feature class _Server extends _Feature {
    @def async not_found() : Promise<Response> {
        fm.log("not_found!");
        return new Response("Not found", { status: 404 });
    }
    @def async handle_request(req: Request): Promise<Response|undefined> {
        return not_found();
    }
    @def async receive_request(req: Request): Promise<Response|undefined> {
        fm.log(req.method, req.url);
        return handle_request(req);
    }
    @def async start_server() {
        os.serve(receive_request, { port: 8000 });
    }
    @def async server() {
        start_server();
    }
}

//------------------------------------------------------------------------------
// Get implements rudimentary file serving

declare const get_path_from_URL: (url: string) => string;
declare const translate_path: (url: string) => string;
declare const serve_file: (req: Request) => Promise<Response|undefined>;
declare const mime_type: (path: string) => string;

@feature class _Get extends _Server {
    static publicFolder: string = os.cwd().replaceAll("/source/ts", "/public");
    static rootFolder: string = os.cwd().replaceAll("/source/ts", "/");

    @before async handle_request(req: Request): Promise<Response|undefined> {
        if (req.method === "GET") {
            return serve_file(req);
        }
    }
    @def async serve_file(req: Request): Promise<Response|undefined> {
        let path = translate_path(req.url);
        if (path) {
            fm.log(path.replace(_Get.rootFolder, ""));
            let content = os.readFile(path);
            let type = mime_type(path); 
            return new Response(content, { headers: { "Content-Type": type } });
        }
    }
    @def get_path_from_URL(url: string): string {
        return url.slice("http://localhost:8000".length);
    }
    @def translate_path(url: string): string {
        let path = get_path_from_URL(url);
        if (path=='/') { path = '/index.html'; }
        return _Get.publicFolder + path;
    }
    @def mime_type(path: string): string {
        const extension = os.extension(path);
        switch (extension) {
            case ".html": return "text/html";
            case ".js": return "application/javascript";
            case ".json": return "application/json";
            case ".ico": return "image/x-icon";
            default: return "application/octet-stream";
        }
    }
}

//------------------------------------------------------------------------------
// GetJS redirects ".js" and ".js.map" requests to the /js folder

@feature class _GetJS extends _Get {
    static tsFolder : string = os.cwd();
    static jsFolder : string = os.cwd().replaceAll("/source/ts", "/build/js");
    @replace translate_path(url: string): string {
        let path = this.existing(translate_path)(url);
        if (path.endsWith(".js") || path.endsWith(".js.map")) {
            path = path.replace(_Get.publicFolder, _GetJS.jsFolder);
        } else if (path.endsWith(".ts")) {
            fm.log("ts path:", path);
            path = path.replace("public/", "");
        }
        return path;
    }
}

//------------------------------------------------------------------------------
// Put implements a simple remote procedure call mechanism

declare const call_function: (req: Request) => Promise<Response|undefined>;

@feature class _Put extends _Server {
    @def async call_function(req: Request): Promise<Response|undefined> {
        let functionName = get_path_from_URL(req.url).slice(1);
        let params = await req.json();
        let func = fm.getModuleScopeFunction(functionName);
        if (func && typeof func === 'function') {
            console.log("calling:", functionName, "with", params);
            const logResult = await fm.log_async(func, ...Object.values(params));
            const response = { result: logResult.result, log: logResult.log };
            return new Response(JSON.stringify(response), { headers: { "Content-Type": "application/json" }, status: 200 });
        } else {
            return not_found();
        }
    }
    @before async handle_request(req: Request): Promise<Response|undefined> {
        if (req.method === "PUT") {
            return call_function(req);
        }
    }
}

//------------------------------------------------------------------------------
// ReadWrite reads and writes file to the local file system

@feature class _ReadWrite extends shared._Files {
    @replace load(path: string): string {
        return os.readFile(path);
    }
    @replace save(path: string, content: string) {
        os.writeFile(path, content);
    }
}

console.log("--------------------------------------------------------------------------------");
console.log("ᕦ(ツ)ᕤ server.fm"); 
shared.load_module(); 
fm.readout(true);
fm.debug(true);
console.log("----------------------------------------------");
await fm.test();
fm.log_print("file:///Users/asnaroo/Desktop/experiments/microserver.fm/source/ts/");
fm.log_flush();
console.log("----------------------------------------------");
fm.log("what the hell");
fm.log_print("file:///Users/asnaroo/Desktop/experiments/microserver.fm/source/ts/");


