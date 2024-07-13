// ᕦ(ツ)ᕤ
// client.fm.ts
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
var _Offline_1;
import { _Feature, feature, def, on, after, make, fm, } from "./util/fm.js";
import * as shared from './shared.fm.js';
import * as browser from './util/browser.js';
import { Device } from './shared.fm.js';
addEventListener("load", () => { client(); });
let _Client = class _Client extends _Feature {
    async client() {
        log("ᕦ(ツ)ᕤ client.fm");
        shared.load_module();
        await fm.test();
        await startup();
        await run();
        await shutdown();
        log("done.");
    }
    async shutdown() { }
};
_Client.server = make(Device, { url: "http://localhost", port: 8000 });
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], _Client.prototype, "client", null);
__decorate([
    after,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], _Client.prototype, "shutdown", null);
_Client = __decorate([
    feature
], _Client);
let _Offline = _Offline_1 = class _Offline extends _Client {
    async startup() {
        return setup_offline();
    }
    async check_online() {
        let online = await ping(_Offline_1.server);
        _Offline_1.offline = !online;
        if (online)
            log("connected");
        else
            log("offline");
    }
    async setup_offline() {
        let msg = await browser.setupServiceWorker();
        if (msg == "success") {
            return check_online();
        }
        else {
            console.log(msg);
        }
    }
};
_Offline.offline = false;
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], _Offline.prototype, "startup", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], _Offline.prototype, "check_online", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], _Offline.prototype, "setup_offline", null);
_Offline = _Offline_1 = __decorate([
    feature
], _Offline);
//# sourceMappingURL=client.fm.js.map