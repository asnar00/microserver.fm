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
import * as features from "./fm.js";
const { _Feature, feature, on, after, before, fm, console_separator } = features;
let _Main = class _Main extends _Feature {
    async client() { console.log("ᕦ(ツ)ᕤ client"); }
};
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], _Main.prototype, "client", null);
_Main = __decorate([
    feature
], _Main);
addEventListener("load", () => { client(); });
