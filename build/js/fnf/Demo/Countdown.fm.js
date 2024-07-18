// ᕦ(ツ)ᕤ
// /Users/asnaroo/Desktop/experiments/microserver.fm/source/ts/fnf/Demo/Countdown.fm.ts
// created from /Users/asnaroo/Desktop/experiments/microserver.fm/source/fnf/Demo/Countdown.md
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { _source } from "/Users/asnaroo/Desktop/experiments/microserver.fm/source/ts/util/test.js";
_source("/Users/asnaroo/Desktop/experiments/microserver.fm/source/fnf/Demo/Countdown.md");
import { feature, on, before, fm } from "/Users/asnaroo/Desktop/experiments/microserver.fm/source/ts/util/fm.ts";
import { _Demo } from "../Demo.fm.js";
let _Countdown = class _Countdown extends _Demo {
    countdown() { fm.log("10 9 8 7 6 5 4 3 2 1"); } //@ 10
    main() { countdown(); } //@ 14
    async _test() {
    }
};
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], _Countdown.prototype, "countdown", null);
__decorate([
    before,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], _Countdown.prototype, "main", null);
_Countdown = __decorate([
    feature
], _Countdown);
export { _Countdown };
//# sourceMappingURL=Countdown.fm.js.map