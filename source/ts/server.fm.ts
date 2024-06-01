// ᕦ(ツ)ᕤ
// server.fm.ts
// feature-modular server
// author: asnaroo

import * as os from "./os.ts";
import { _Feature, feature, on, after, before, fm, console_separator } from "./fm.ts";
import * as shared from "./shared.fm.ts";

//------------------------------------------------------------------------------
// Main doesn't do much

declare const server: () => Promise<void>;

@feature class _Main extends _Feature {
    @on async server() { console.log("ᕦ(ツ)ᕤ server"); shared.load(); }
}

//------------------------------------------------------------------------------
// Server listens on port 8000 but only returns "not found" for now

declare const notFound: () => Promise<Response>;
declare const handle: (req: Request) => Promise<Response|undefined>;
declare const receiveRequest: (req: Request) => Promise<Response>;
declare const startServer: () => Promise<void>;

@feature class _Server extends _Main {
    @on async notFound() : Promise<Response> {
        console.log("notFound!");
        return new Response("Not found", { status: 404 });
    }
    @on async handle(req: Request): Promise<Response|undefined> {
        return notFound();
    }
    @on async receiveRequest(req: Request): Promise<Response|undefined> {
        console.log(req.method, req.url);
        return handle(req);
    }
    @on async startServer() {
        os.serve(receiveRequest, { port: 8000 });
    }
    @after async server() {
        startServer();
    }
}

//------------------------------------------------------------------------------
// Get implements rudimentary file serving

declare const getPathFromUrl: (url: string) => string;
declare const translatePath: (url: string) => string;
declare const serveFile: (req: Request) => Promise<Response|undefined>;

@feature class _Get extends _Server {
    static publicFolder: string = os.cwd().replaceAll("/source/ts", "/public");
    static rootFolder: string = os.cwd().replaceAll("/source/ts", "/");
    
    @on getPathFromUrl(url: string): string {
        return url.slice("http://localhost:8000".length);
    }
    @on translatePath(url: string): string {
        let path = getPathFromUrl(url);
        if (path=='/') { path = '/index.html'; }
        return _Get.publicFolder + path;
    }
    @on async serveFile(req: Request): Promise<Response|undefined> {
        let path = translatePath(req.url);
        if (path) {
            console.log(path.replace(_Get.rootFolder, ""));
            return await os.serveFile(req, path); 
        }
    }
    @before async handle(req: Request): Promise<Response|undefined> {
        if (req.method === "GET") {
            return serveFile(req);
        }
    }
}

//------------------------------------------------------------------------------
// GetJS redirects ".js" requests to the /js folder

@feature class _GetJS extends _Get {
    static jsFolder : string = os.cwd().replaceAll("/source/ts", "/build/js");
    @on translatePath(url: string): string {
        let path = this.existing(translatePath)(url);
        if (path.endsWith(".js")) {
            path = path.replace(_Get.publicFolder, _GetJS.jsFolder);
        }
        return path;
    }
}

//------------------------------------------------------------------------------
// Put implements a simple remote procedure call mechanism

declare const callFunction: (req: Request) => Promise<Response|undefined>;

@feature class _Put extends _Server {
    @on async callFunction(req: Request): Promise<Response|undefined> {
        let functionName = getPathFromUrl(req.url).slice(1);
        let params = await req.json();
        let func = fm.getModuleScopeFunction(functionName);
        if (func && typeof func === 'function') {
            let result : any = func(...Object.values(params));
            if (result instanceof Promise) { result = await result; }
            return new Response(JSON.stringify(result), { status: 200 });
        }
    }
    @before async handle(req: Request): Promise<Response|undefined> {
        if (req.method === "PUT") {
            return callFunction(req);
        }
    }
}

//------------------------------------------------------------------------------
// Greet adds a "greet" function that returns a greeting

@feature class _Greet extends _Put {
    @on greet(name: string): string {
        let result = `Hello, ${name}!`;
        console.log(result);
        return result;
    }
}

console_separator();
fm.readout();
fm.listModuleScopeFunctions();
fm.debug(true);
console_separator();

server();