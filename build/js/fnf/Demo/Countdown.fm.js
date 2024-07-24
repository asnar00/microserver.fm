// ᕦ(ツ)ᕤ
// /ts/fnf/Demo/Countdown.fm.ts
// created from /fnf/Demo/Countdown.md
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { feature, def, before, fm } from "../../util/fm.js";
import { _Demo } from "../Demo.fm.js";
let _Countdown = class _Countdown extends _Demo {
    countdown() { fm.log("10 9 8 7 6 5 4 3 2 1"); }
    demo() { countdown(); }
    async _test() {
        fm._source("/fnf/Demo/Countdown.md");
    }
};
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], _Countdown.prototype, "countdown", null);
__decorate([
    before,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], _Countdown.prototype, "demo", null);
_Countdown = __decorate([
    feature
], _Countdown);
export { _Countdown };
//# sourceMappingURL=Countdown.fm.js.map