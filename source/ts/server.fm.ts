// ᕦ(ツ)ᕤ
// another feature-modular experiment

import * as deno_http from "https://deno.land/std@0.165.0/http/server.ts";
import * as deno_file from "https://deno.land/std@0.165.0/http/file_server.ts";
import * as features from "./fm.ts";
const { Feature, feature, on, after, before, fm } = features;

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
            result = fm.handler(req);
        } catch (error: any) {
            result = new Response("Exception: " + error.message, { status: 500 });
        }
        return result;
    }
    @after async main() {
        deno_http.serve(fm.receiveRequest, { port: 8000 });
    }
}

//------------------------------------------------------------------------------

@feature(Server) class Get {
    workingDirectory: string = Deno.cwd();
    @on translatePath(url: string): string {
        let path = url.slice("http://localhost:8000".length);
        if (path=='/') { path = '/index.html'; }
        let root = "/Users/asnaroo/desktop/experiments/microserver.fm/public";
        let result= root + path;
        console.log("path:", result);
        return result;
    }
    @on async serveFile(req: Request): Promise<Response|undefined> {
        let path = fm.translatePath(req.url);
        if (path) {
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

@feature(Server) class Put {
    @on async callFunction(req: Request): Promise<Response|undefined> {
        let functionName = req.url.slice("http://localhost:8000/".length);
        let params = await req.json();
        if (typeof fm[functionName] === 'function') {
            const result = fm[functionName](...Object.values(params));
            if (result instanceof Promise) {
                let actualResult = await result;
                return new Response(JSON.stringify(actualResult), { status: 200 });
            } else {
                return new Response(JSON.stringify(result), { status: 200 });
            }
        }
    }
    @before async handler(req: Request): Promise<Response|undefined> {
        if (req.method === "PUT") {
            return fm.callFunction(req);
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
// list all methods in fm

console.log("fm", fm);
fm.main();