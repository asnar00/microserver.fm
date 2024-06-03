// ᕦ(ツ)ᕤ
// server.fm.ts
// feature-modular server
// author: asnaroo

import { log, log_group, log_end_group} from './util/logging.js';
import * as os from "./util/os.ts";
import { _Feature, feature, def, replace, on, after, before, fm } from "./fm.ts";
import * as shared from "./shared.fm.ts";

//------------------------------------------------------------------------------
// Main doesn't do much

declare const server: () => Promise<void>;

@feature class _Main extends _Feature {
    @def async server() { log("ᕦ(ツ)ᕤ server.fm"); shared.load_module(); }
}

//------------------------------------------------------------------------------
// Server listens on port 8000 but only returns "not found" for now

declare const not_found: () => Promise<Response>;
declare const handle: (req: Request) => Promise<Response|undefined>;
declare const receive_request: (req: Request) => Promise<Response>;
declare const start_server: () => Promise<void>;

@feature class _Server extends _Main {
    @def async not_found() : Promise<Response> {
        log("not_found!");
        return new Response("Not found", { status: 404 });
    }
    @def async handle(req: Request): Promise<Response|undefined> {
        return not_found();
    }
    @def async receive_request(req: Request): Promise<Response|undefined> {
        log(req.method, req.url);
        return handle(req);
    }
    @def async start_server() {
        os.serve(receive_request, { port: 8000 });
    }
    @after async server() {
        start_server();
    }
}

//------------------------------------------------------------------------------
// Get implements rudimentary file serving

declare const get_path_from_URL: (url: string) => string;
declare const translate_path: (url: string) => string;
declare const serve_file: (req: Request) => Promise<Response|undefined>;

@feature class _Get extends _Server {
    static publicFolder: string = os.cwd().replaceAll("/source/ts", "/public");
    static rootFolder: string = os.cwd().replaceAll("/source/ts", "/");
    
    @def get_path_from_URL(url: string): string {
        return url.slice("http://localhost:8000".length);
    }
    @def translate_path(url: string): string {
        let path = get_path_from_URL(url);
        if (path=='/') { path = '/index.html'; }
        return _Get.publicFolder + path;
    }
    @def async serve_file(req: Request): Promise<Response|undefined> {
        let path = translate_path(req.url);
        if (path) {
            log(path.replace(_Get.rootFolder, ""));
            return await os.serve_file(req, path); 
        }
    }
    @before async handle(req: Request): Promise<Response|undefined> {
        if (req.method === "GET") {
            return serve_file(req);
        }
    }
}

//------------------------------------------------------------------------------
// GetJS redirects ".js" requests to the /js folder

@feature class _GetJS extends _Get {
    static jsFolder : string = os.cwd().replaceAll("/source/ts", "/build/js");
    @replace translate_path(url: string): string {
        let path = this.existing(translate_path)(url);
        if (path.endsWith(".js")) {
            path = path.replace(_Get.publicFolder, _GetJS.jsFolder);
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
            log("calling:", functionName, "with", params);
            let result : any = func(...Object.values(params));
            if (result instanceof Promise) { result = await result; }
            return new Response(JSON.stringify(result), { status: 200 });
        } else {
            return not_found();
        }
    }
    @before async handle(req: Request): Promise<Response|undefined> {
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

fm.readout();
fm.listModuleScopeFunctions();
fm.debug(true);

server();