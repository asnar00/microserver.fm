// ᕦ(ツ)ᕤ
// server.fm.ts
// feature-modular deno server
// author: asnaroo

import * as deno_http from "https://deno.land/std@0.165.0/http/server.ts";
import * as deno_file from "https://deno.land/std@0.165.0/http/file_server.ts";
import * as features from "./fm.ts";
const { Feature, feature, on, after, before, fm } = features;

//------------------------------------------------------------------------------
// Main doesn't do much

@feature(Feature) class Main {
    @on async main() {
        console.log("ᕦ(ツ)ᕤ");
        console.log("feature modular server");
    }
}

//------------------------------------------------------------------------------
// Server listens on port 8000 but only returns "not found" for now

@feature(Main) class Server { 
    @on async handler(req: Request): Promise<Response> {
        return new Response("Not found", { status: 404 });
    }
    @on async receiveRequest(req: Request): Promise<Response> {
        console.log(req.method, req.url);
        let result= null;
        try {
            result = fm.handler(req);
        } catch (error: any) {
            result = new Response("Exception: " + error.message, { status: 500 });
        }
        return result;
    }
    @on async startServer() {
        deno_http.serve(fm.receiveRequest, { port: 8000 });
    }
    @after async main() {
        fm.startServer();
    }
}

//------------------------------------------------------------------------------
// Get implements rudimentary file serving

@feature(Server) class Get {
    publicFolder: string = Deno.cwd().replaceAll("/source/ts", "/public");
    @on getPathFromUrl(url: string): string {
        return url.slice("http://localhost:8000".length);
    }
    @on translatePath(url: string): string {
        let path = fm.getPathFromUrl(url);
        if (path=='/') { path = '/index.html'; }
        return fm.Get.publicFolder + path;
    }
    @on async serveFile(req: Request): Promise<Response|undefined> {
        let path = fm.translatePath(req.url);
        if (path) {
            console.log(path.replace(fm.Get.publicFolder, ""));
            return await deno_file.serveFile(req, path); 
        }
    }
    @before async handler(req: Request): Promise<Response|undefined> {
        if (req.method === "GET") {
            return fm.serveFile(req);
        }
    }
}

//------------------------------------------------------------------------------
// Put implements a simple remote procedure call mechanism

@feature(Server) class Put {
    @on async callFunction(req: Request): Promise<Response|undefined> {
        let functionName = fm.getPathFromUrl(req.url).slice(1);
        let params = await req.json();
        if (typeof fm[functionName] === 'function') {
            let result : any = fm[functionName](...Object.values(params));
            if (result instanceof Promise) {
                result = await result;
            }
            return new Response(JSON.stringify(result), { status: 200 });
        }
    }
    @before async handler(req: Request): Promise<Response|undefined> {
        if (req.method === "PUT") {
            return fm.callFunction(req);
        }
    }
}

//------------------------------------------------------------------------------
// Greet adds a "greet" function that returns a greeting

@feature(Put) class Greet {
    @on greet(name: string): string {
        let result = `Hello, ${name}!`;
        console.log(result);
        return result;
    }
}

//------------------------------------------------------------------------------
console.log("---------------------------------------------");
console.log("ᕦ(ツ)ᕤ");
console.log("microserver.fm");
fm._manager.build();
fm._manager.readout_features();
fm._manager.readout_functions();
console.log("---------------------------------------------");
fm.main();