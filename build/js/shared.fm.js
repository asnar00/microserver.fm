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
import { _Feature, feature, on, struct } from "./fm.js";
//-----------------------------------------------------------------------------
// Run
export const load = () => { console.log("loaded shared module"); };
let _DoSomething = class _DoSomething extends _Feature {
    run() { console.log("shared run"); }
};
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], _DoSomething.prototype, "run", null);
_DoSomething = __decorate([
    feature
], _DoSomething);
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
    device_accessible(d) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fetchUrl = `${d.url}:${d.port}`; // or some non-cached path
                yield fetch(fetchUrl, { method: 'PUT', cache: 'no-store', body: "{}" });
                return true; // if it gets here, we're good
            }
            catch (error) {
                return false;
            }
        });
    }
    device_proxy(d, targetFunction) {
        const functionName = targetFunction.name;
        return new Proxy(targetFunction, {
            apply: function (target, thisArg, argumentsList) {
                return __awaiter(this, void 0, void 0, function* () {
                    const params = {};
                    const paramNames = target.toString().match(/\(([^)]*)\)/)[1].split(',').map(param => param.trim());
                    paramNames.forEach((paramName, index) => {
                        params[paramName] = argumentsList[index];
                    });
                    const response = yield fetch(`${d.url}:${d.port}/${functionName}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(params)
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    const responseData = yield response.json();
                    return responseData.result;
                });
            }
        });
    }
    ;
};
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Device]),
    __metadata("design:returntype", Promise)
], _Device.prototype, "device_accessible", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Device, Function]),
    __metadata("design:returntype", void 0)
], _Device.prototype, "device_proxy", null);
_Device = __decorate([
    feature
], _Device);
