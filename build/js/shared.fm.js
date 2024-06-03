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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _Logging_1;
import { _Feature, feature, on, after, struct, make, fm } from "./fm.js";
//-----------------------------------------------------------------------------
// Run
export const load_module = () => { log("loaded shared module"); };
let _Shared = class _Shared extends _Feature {
    run() {
        return __awaiter(this, void 0, void 0, function* () { log("shared run"); });
    }
};
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], _Shared.prototype, "run", null);
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
function paramList(func) {
    const funcStr = func.toString();
    const paramStr = funcStr.match(/\(([^)]*)\)/)[1];
    const params = paramStr.split(',').map(param => param.trim()).filter(param => param);
    return params;
}
let _Device = class _Device extends _Feature {
    stub() { return true; }
    ping(d) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return remote(d, stub)();
            }
            catch (e) {
                return false;
            }
        });
    }
    remote(d, targetFunction) {
        let functionName = targetFunction.name;
        if (functionName.startsWith("bound ")) {
            functionName = functionName.slice(6);
        }
        const paramNames = fm.getFunctionParams(functionName);
        return new Proxy(targetFunction, {
            apply: function (target, thisArg, argumentsList) {
                return __awaiter(this, void 0, void 0, function* () {
                    const params = {};
                    paramNames.forEach((paramName, index) => {
                        params[paramName] = argumentsList[index];
                    });
                    return rpc(d, functionName, params);
                });
            }
        });
    }
    ;
    rpc(d, functionName, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${d.url}:${d.port}/${functionName}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const responseData = yield response.json();
            return responseData;
        });
    }
};
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Boolean)
], _Device.prototype, "stub", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Device]),
    __metadata("design:returntype", Promise)
], _Device.prototype, "ping", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Device, Function]),
    __metadata("design:returntype", void 0)
], _Device.prototype, "remote", null);
__decorate([
    on,
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
        log(result);
        return result;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const server = make(Device, { url: "http://localhost", port: 8000 });
            greet("asnaroo");
            const msg = yield remote(server, greet)("asnaroo");
            log("server:", msg);
        });
    }
};
__decorate([
    on,
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
    load(filename) { log("not implemented"); return ""; }
    save(filename, text) { log("not implemented"); }
};
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", String)
], _Files.prototype, "load", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], _Files.prototype, "save", null);
_Files = __decorate([
    feature
], _Files);
export { _Files };
let _Logging = _Logging_1 = class _Logging extends _Feature {
    log(...args) {
        let message = args.map(arg => stringify(arg)).join(' ');
        _Logging_1.lines.push(message);
        console.log(message);
    }
    stringify(arg) {
        if (typeof arg === 'object') {
            try {
                return JSON.stringify(arg, null, 2);
            }
            catch (error) {
                console.log(error);
                return "ack! error stringifying object";
            }
        }
        else {
            return String(arg);
        }
    }
};
_Logging.lines = [];
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], _Logging.prototype, "log", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], _Logging.prototype, "stringify", null);
_Logging = _Logging_1 = __decorate([
    feature
], _Logging);
