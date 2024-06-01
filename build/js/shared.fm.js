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
import { _Feature, feature, on } from "./fm.js";
//-----------------------------------------------------------------------------
// Run
export const load = () => { console.log("loaded shared module"); };
let _DoSomething = class _DoSomething extends _Feature {
    doSomething() { console.log("modified doSomething"); }
};
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], _DoSomething.prototype, "doSomething", null);
_DoSomething = __decorate([
    feature
], _DoSomething);
