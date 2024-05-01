// ᕦ(ツ)ᕤ
// another feature-modular experiment
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
import * as features from "./fm.ts";
const { Feature, feature, on, after, before, fx } = features;
//------------------------------------------------------------------------------
let Main = class Main {
    main() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("ᕦ(ツ)ᕤ");
            console.log("feature modular server");
        });
    }
};
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Main.prototype, "main", null);
Main = __decorate([
    feature(Feature)
], Main);
//------------------------------------------------------------------------------
let Server = class Server {
    handler(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Response("Not found", { status: 404 });
        });
    }
    receiveRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(req.method, req.url);
            let result = null;
            try {
                result = fx.handler(req);
            }
            catch (error) {
                result = new Response("Exception: " + error.message, { status: 500 });
            }
            return result;
        });
    }
    main() {
        return __awaiter(this, void 0, void 0, function* () {
            deno_http.serve(fx.receiveRequest, { port: 8000 });
        });
    }
};
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request]),
    __metadata("design:returntype", Promise)
], Server.prototype, "handler", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request]),
    __metadata("design:returntype", Promise)
], Server.prototype, "receiveRequest", null);
__decorate([
    after,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Server.prototype, "main", null);
Server = __decorate([
    feature(Main)
], Server);
//------------------------------------------------------------------------------
let Get = class Get {
    constructor() {
        this.publicFolder = Deno.cwd().replaceAll("/source/ts", "/public");
    }
    translatePath(url) {
        let path = url.slice("http://localhost:8000".length);
        if (path == '/') {
            path = '/index.html';
        }
        let result = fx.Get.publicFolder + path;
        console.log("path:", result);
        return result;
    }
    serveFile(req) {
        return __awaiter(this, void 0, void 0, function* () {
            let path = fx.translatePath(req.url);
            if (path) {
                return yield deno_file.serveFile(req, path);
            }
        });
    }
    handler(req) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.method === "GET") {
                return fx.serveFile(req);
            }
        });
    }
};
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", String)
], Get.prototype, "translatePath", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request]),
    __metadata("design:returntype", Promise)
], Get.prototype, "serveFile", null);
__decorate([
    before,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request]),
    __metadata("design:returntype", Promise)
], Get.prototype, "handler", null);
Get = __decorate([
    feature(Server)
], Get);
//------------------------------------------------------------------------------
let Put = class Put {
    callFunction(req) {
        return __awaiter(this, void 0, void 0, function* () {
            let functionName = req.url.slice("http://localhost:8000/".length);
            let params = yield req.json();
            if (typeof fx[functionName] === 'function') {
                const result = fx[functionName](...Object.values(params));
                if (result instanceof Promise) {
                    let actualResult = yield result;
                    return new Response(JSON.stringify(actualResult), { status: 200 });
                }
                else {
                    return new Response(JSON.stringify(result), { status: 200 });
                }
            }
        });
    }
    handler(req) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.method === "PUT") {
                return fx.callFunction(req);
            }
        });
    }
};
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request]),
    __metadata("design:returntype", Promise)
], Put.prototype, "callFunction", null);
__decorate([
    before,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request]),
    __metadata("design:returntype", Promise)
], Put.prototype, "handler", null);
Put = __decorate([
    feature(Server)
], Put);
//------------------------------------------------------------------------------
let Greet = class Greet {
    greet(name) {
        let result = `Hello, ${name}!`;
        console.log(result);
        return result;
    }
};
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", String)
], Greet.prototype, "greet", null);
Greet = __decorate([
    feature(Put)
], Greet);
