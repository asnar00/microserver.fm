// ᕦ(ツ)ᕤ
// server.fm.ts
// feature-modular server
// author: asnaroo
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _Get_1;
import * as os from "./os.ts";
import * as features from "./fm.ts";
const { _Feature, feature, on, after, before, fm, console_separator } = features;
let _Main = class _Main extends _Feature {
    async server() { console.log("ᕦ(ツ)ᕤ server"); }
};
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], _Main.prototype, "server", null);
_Main = __decorate([
    feature
], _Main);
let _Server = class _Server extends _Main {
    async notFound() {
        return new Response("Not found", { status: 404 });
    }
    async handle(req) {
        return notFound();
    }
    async receiveRequest(req) {
        console.log(req.method, req.url);
        return handle(req);
    }
    async startServer() {
        os.serve(receiveRequest, { port: 8000 });
    }
    async server() {
        startServer();
    }
};
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], _Server.prototype, "notFound", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request]),
    __metadata("design:returntype", Promise)
], _Server.prototype, "handle", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request]),
    __metadata("design:returntype", Promise)
], _Server.prototype, "receiveRequest", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], _Server.prototype, "startServer", null);
__decorate([
    after,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], _Server.prototype, "server", null);
_Server = __decorate([
    feature
], _Server);
let _Get = _Get_1 = class _Get extends _Server {
    getPathFromUrl(url) {
        return url.slice("http://localhost:8000".length);
    }
    translatePath(url) {
        let path = getPathFromUrl(url);
        if (path == '/') {
            path = '/index.html';
        }
        return _Get_1.publicFolder + path;
    }
    async serveFile(req) {
        let path = translatePath(req.url);
        if (path) {
            console.log(path.replace(_Get_1.publicFolder, ""));
            return await os.serveFile(req, path);
        }
    }
    async handle(req) {
        if (req.method === "GET") {
            return serveFile(req);
        }
    }
};
_Get.publicFolder = os.cwd().replaceAll("/source/ts", "/public");
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", String)
], _Get.prototype, "getPathFromUrl", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", String)
], _Get.prototype, "translatePath", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request]),
    __metadata("design:returntype", Promise)
], _Get.prototype, "serveFile", null);
__decorate([
    before,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request]),
    __metadata("design:returntype", Promise)
], _Get.prototype, "handle", null);
_Get = _Get_1 = __decorate([
    feature
], _Get);
let _Put = class _Put extends _Server {
    async callFunction(req) {
        let functionName = getPathFromUrl(req.url).slice(1);
        let params = await req.json();
        let func = fm.getModuleScopeFunction(functionName);
        if (func && typeof func === 'function') {
            let result = func(...Object.values(params));
            if (result instanceof Promise) {
                result = await result;
            }
            return new Response(JSON.stringify(result), { status: 200 });
        }
    }
    async handle(req) {
        if (req.method === "PUT") {
            return callFunction(req);
        }
    }
};
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request]),
    __metadata("design:returntype", Promise)
], _Put.prototype, "callFunction", null);
__decorate([
    before,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request]),
    __metadata("design:returntype", Promise)
], _Put.prototype, "handle", null);
_Put = __decorate([
    feature
], _Put);
//------------------------------------------------------------------------------
// Greet adds a "greet" function that returns a greeting
let _Greet = class _Greet extends _Put {
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
], _Greet.prototype, "greet", null);
_Greet = __decorate([
    feature
], _Greet);
console_separator();
fm.readout();
fm.debug(true);
console_separator();
server();
