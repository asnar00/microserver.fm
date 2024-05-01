// ᕦ(ツ)ᕤ
// server.fm.ts
// feature-modular deno server
// author: asnaroo

import * as deno_http from "https://deno.land/std@0.165.0/http/server.ts";
import * as deno_file from "https://deno.land/std@0.165.0/http/file_server.ts";
import * as features from "./fm.ts";
const { Feature, feature, on, after, before, fm, fx } = features;

//------------------------------------------------------------------------------

@feature(Feature) class Main {
    @on async main() {
        console.log("ᕦ(ツ)ᕤ");
        console.log("feature modular server");
    }
}

//------------------------------------------------------------------------------

@feature(Main) class Server {
    @on async handler(req: Request): Promise<Response> {
        return new Response("Not found", { status: 404 });
    }
    @on async receiveRequest(req: Request): Promise<Response> {
        console.log(req.method, req.url);
        let result= null;
        try {
            result = fx.handler(req);
        } catch (error: any) {
            result = new Response("Exception: " + error.message, { status: 500 });
        }
        return result;
    }
    @on async startServer() {
        deno_http.serve(fx.receiveRequest, { port: 8000 });
    }
    @after async main() {
        fx.startServer();
    }
}

//------------------------------------------------------------------------------

@feature(Server) class Get {
    publicFolder: string = Deno.cwd().replaceAll("/source/ts", "/public");
    @on getPathFromUrl(url: string): string {
        return url.slice("http://localhost:8000".length);
    }
    @on translatePath(url: string): string {
        let path = fx.getPathFromUrl(url);
        if (path=='/') { path = '/index.html'; }
        return fx.Get.publicFolder + path;
    }
    @on async serveFile(req: Request): Promise<Response|undefined> {
        let path = fx.translatePath(req.url);
        if (path) {
            return await deno_file.serveFile(req, path); 
        }
    }
    @before async handler(req: Request): Promise<Response|undefined> {
        if (req.method === "GET") {
            return fx.serveFile(req);
        }
    }
}

//------------------------------------------------------------------------------

@feature(Server) class Put {
    @on async callFunction(req: Request): Promise<Response|undefined> {
        let functionName = fx.getPathFromUrl(req.url).slice(1);
        let params = await req.json();
        if (typeof fx[functionName] === 'function') {
            let result : any = fx[functionName](...Object.values(params));
            if (result instanceof Promise) {
                result = await result;
            }
            return new Response(JSON.stringify(result), { status: 200 });
        }
    }
    @before async handler(req: Request): Promise<Response|undefined> {
        if (req.method === "PUT") {
            return fx.callFunction(req);
        }
    }
}

//------------------------------------------------------------------------------

@feature(Put) class Greet {
    @on greet(name: string): string {
        let result = `Hello, ${name}!`;
        console.log(result);
        return result;
    }
}

//------------------------------------------------------------------------------
console.log("ᕦ(ツ)ᕤ");
console.log("microserver.fm");
fm.build_fx_disable([]);
fm.readout_features();
fx.main();