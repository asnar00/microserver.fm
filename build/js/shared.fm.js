// ᕦ(ツ)ᕤ
// shared.fm.ts
// feature-modular experiments
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
import { _Feature, feature, def, after, struct, make, fm } from "./util/fm.js";
//-----------------------------------------------------------------------------
// Run
export const load_module = () => { };
let _Shared = class _Shared extends _Feature {
    async startup() { }
    async run() { }
    async shutdown() { }
    async _test() {
        fm.log("hello from _Shared.test()");
        return true;
    }
};
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], _Shared.prototype, "startup", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], _Shared.prototype, "run", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], _Shared.prototype, "shutdown", null);
_Shared = __decorate([
    feature
], _Shared);
//-----------------------------------------------------------------------------
// Devices : things like servers, laptops, phones, drones, etc.
// a Device is accessible via network; has URL and port.
// you can check if it's accessible, and call functions remotely on it.
let Device = class Device {
    constructor() {
        this.url = "";
        this.port = 0;
    }
};
Device = __decorate([
    struct
], Device);
export { Device };
let _Device = class _Device extends _Feature {
    stub() { fm.log("inside stub, returning", true); return true; }
    async ping(d) {
        try {
            return remote(d, stub)();
        }
        catch (e) {
            return false;
        }
    }
    remote(d, targetFunction) {
        let functionName = targetFunction.name;
        if (functionName.startsWith("bound ")) {
            functionName = functionName.slice(6);
        }
        const paramNames = fm.getFunctionParams(functionName);
        return new Proxy(targetFunction, {
            apply: async function (target, thisArg, argumentsList) {
                const params = {};
                paramNames.forEach((paramName, index) => {
                    params[paramName] = argumentsList[index];
                });
                return rpc(d, functionName, params);
            }
        });
    }
    ;
    async rpc(d, functionName, params) {
        const response = await fetch(`${d.url}:${d.port}/${functionName}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const responseData = await response.json();
        const log = responseData.log;
        if (log) {
            log.title = `rpc.${functionName}`;
            fm.log_push(log, fm.get_log_manager(fm.get_stack()).current);
        }
        return responseData.result;
    }
};
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Boolean)
], _Device.prototype, "stub", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Device]),
    __metadata("design:returntype", Promise)
], _Device.prototype, "ping", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Device, Function]),
    __metadata("design:returntype", void 0)
], _Device.prototype, "remote", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Device, String, Object]),
    __metadata("design:returntype", Promise)
], _Device.prototype, "rpc", null);
_Device = __decorate([
    feature
], _Device);
let _Greet = class _Greet extends _Shared {
    greet(name) {
        let result = `hello, ${name}!`;
        console.log("inside greet", name);
        fm.log("tickle it ya wrigglers");
        return result;
    }
    async run() {
        const server = make(Device, { url: "http://localhost", port: 8000 });
        fm.log(greet("asnaroo"));
        const msg = await remote(server, greet)("asnaroo");
        fm.log("server:", msg);
    }
};
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", String)
], _Greet.prototype, "greet", null);
__decorate([
    after,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], _Greet.prototype, "run", null);
_Greet = __decorate([
    feature
], _Greet);
let _Files = class _Files extends _Feature {
    load(filename) { fm.log("not implemented"); return ""; }
    save(filename, text) { fm.log("not implemented"); }
};
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", String)
], _Files.prototype, "load", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], _Files.prototype, "save", null);
_Files = __decorate([
    feature
], _Files);
export { _Files };
//# sourceMappingURL=shared.fm.js.map