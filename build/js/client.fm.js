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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _Offline_1;
import { log, log_group, log_end_group } from './util/logging.js';
import { _Feature, feature, def, on, after, make } from "./fm.js";
import * as shared from './shared.fm.js';
import * as browser from './util/browser.js';
import { Device } from './shared.fm.js';
addEventListener("load", () => { client(); });
let _Client = class _Client extends _Feature {
    client() {
        return __awaiter(this, void 0, void 0, function* () {
            log_group("ᕦ(ツ)ᕤ client.fm");
            shared.load_module();
            yield startup();
            yield run();
            yield shutdown();
            log("done.");
            log_end_group();
        });
    }
    shutdown() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
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
    startup() {
        return __awaiter(this, void 0, void 0, function* () {
            return setup_offline();
        });
    }
    check_online() {
        return __awaiter(this, void 0, void 0, function* () {
            let online = yield ping(_Offline_1.server);
            _Offline_1.offline = !online;
            if (online)
                log("connected");
            else
                log("offline");
        });
    }
    setup_offline() {
        return __awaiter(this, void 0, void 0, function* () {
            let msg = yield browser.setupServiceWorker();
            if (msg == "success") {
                return check_online();
            }
            else {
                console.log(msg);
            }
        });
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
