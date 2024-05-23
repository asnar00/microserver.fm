// ᕦ(ツ)ᕤ
// server.fm.ts
// feature-modular deno server
// author: asnaroo

import * as deno_http from "https://deno.land/std@0.165.0/http/server.ts";
import * as deno_file from "https://deno.land/std@0.165.0/http/file_server.ts";
import * as features from "./fm.ts";

const { Feature, feature, on, after, before, fm, console_separator } = features;

//------------------------------------------------------------------------------
// Main doesn't do much

declare const main: () => Promise<void>;

@feature class Main extends Feature {
    @on async main() {
        console.log("microserver.fm");
    }
}

//------------------------------------------------------------------------------
// Server listens on port 8000 but only returns "not found" for now

declare const notFound: () => Promise<Response>;
declare const handler: (req: Request) => Promise<Response|undefined>;
declare const receiveRequest: (req: Request) => Promise<Response>;
declare const startServer: () => Promise<void>;

@feature class Server extends Main {
    @on async notFound() : Promise<Response> {
        return new Response("Not found", { status: 404 });
    }
    @on async handler(req: Request): Promise<Response|undefined> {
        return notFound();
    }
    @on async receiveRequest(req: Request): Promise<Response|undefined> {
        console.log(req.method, req.url);
        return handler(req);
    }
    @on async startServer() {
        deno_http.serve(receiveRequest, { port: 8000 });
    }
    @after async main() {
        startServer();
    }
}

//------------------------------------------------------------------------------
// Get implements rudimentary file serving

declare const getPathFromUrl: (url: string) => string;
declare const translatePath: (url: string) => string;
declare const serveFile: (req: Request) => Promise<Response|undefined>;

@feature class Get extends Server {
    static publicFolder: string = Deno.cwd().replaceAll("/source/ts", "/public");
    
    @on getPathFromUrl(url: string): string {
        return url.slice("http://localhost:8000".length);
    }
    @on translatePath(url: string): string {
        let path = getPathFromUrl(url);
        if (path=='/') { path = '/index.html'; }
        return Get.publicFolder + path;
    }
    @on async serveFile(req: Request): Promise<Response|undefined> {
        let path = translatePath(req.url);
        if (path) {
            console.log(path.replace(Get.publicFolder, ""));
            return await deno_file.serveFile(req, path); 
        }
    }
    @before async handler(req: Request): Promise<Response|undefined> {
        if (req.method === "GET") {
            return serveFile(req);
        }
    }
}

//------------------------------------------------------------------------------
// Put implements a simple remote procedure call mechanism

declare const callFunction: (req: Request) => Promise<Response|undefined>;

@feature class Put extends Server {
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
    @before async handler(req: Request): Promise<Response|undefined> {
        if (req.method === "PUT") {
            return callFunction(req);
        }
    }
}

//------------------------------------------------------------------------------
// Greet adds a "greet" function that returns a greeting

@feature class Greet extends Put {
    @on greet(name: string): string {
        let result = `Hello, ${name}!`;
        console.log(result);
        return result;
    }
}

//------------------------------------------------------------------------------

console_separator();
fm.readout();
fm.debug(true);
console_separator();

main();