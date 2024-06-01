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
import { _Feature, feature, on, after, make, fm } from "./fm.js";
import * as shared from './shared.fm.js';
import { Device } from './shared.fm.js';
addEventListener("load", () => { client(); });
let _Client = class _Client extends _Feature {
    client() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("ᕦ(ツ)ᕤ client");
            fm.readout();
            fm.listModuleScopeFunctions();
            shared.load();
        });
    }
};
_Client.server = make(Device, { url: "http://localhost", port: 8000 });
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], _Client.prototype, "client", null);
_Client = __decorate([
    feature
], _Client);
let _Offline = _Offline_1 = class _Offline extends _Client {
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("_Offline.setup");
            if ('serviceWorker' in navigator) {
                try {
                    let registration = yield navigator.serviceWorker.getRegistration();
                    if (registration) {
                        console.log('  already registered with scope:', registration.scope);
                    }
                    else {
                        yield navigator.serviceWorker.register('/service-worker.js');
                        registration = yield navigator.serviceWorker.getRegistration();
                        if (registration)
                            console.log('  registration successful with scope:', registration.scope);
                        else {
                            console.log('  registration failed.');
                            return;
                        }
                    }
                    registration.onupdatefound = () => {
                        const installingWorker = registration.installing;
                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed') {
                                if (navigator.serviceWorker.controller) {
                                    console.log('New or updated service worker is installed.');
                                }
                                else {
                                    console.log('Service worker is installed for the first time.');
                                }
                            }
                        };
                    };
                    registration.update();
                }
                catch (err) {
                    console.log('  registration failed:', err);
                }
            }
            else {
                console.log('  Service workers are not supported! Offline mode disabled.');
            }
        });
    }
    client() {
        return __awaiter(this, void 0, void 0, function* () {
            yield setup();
            let online = yield device_accessible(_Offline_1.server);
            _Offline_1.offline = !online;
            if (online)
                console.log("  connected");
            else
                console.log("  offline");
        });
    }
};
_Offline.offline = false;
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], _Offline.prototype, "setup", null);
__decorate([
    after,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], _Offline.prototype, "client", null);
_Offline = _Offline_1 = __decorate([
    feature
], _Offline);
//-----------------------------------------------------------------------------
// Run runs shared things
let _Run = class _Run extends _Client {
    client() {
        return __awaiter(this, void 0, void 0, function* () { run(); });
    }
};
__decorate([
    after,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], _Run.prototype, "client", null);
_Run = __decorate([
    feature
], _Run);
