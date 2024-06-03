// ᕦ(ツ)ᕤ
// hello.fm.ts
// feature modular hello world
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { _Feature, feature, on, after, before, fm } from "../fm.js";
let _Main = class _Main extends _Feature {
    main() { console.log("ᕦ(ツ)ᕤ"); }
};
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], _Main.prototype, "main", null);
_Main = __decorate([
    feature
], _Main);
let _Hello = class _Hello extends _Main {
    hello() { console.log("hello world"); }
    main() { hello("asnaroo"); }
};
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], _Hello.prototype, "hello", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], _Hello.prototype, "main", null);
_Hello = __decorate([
    feature
], _Hello);
let _Goodbye = class _Goodbye extends _Main {
    bye() { console.log("kthxbye"); }
    main() { bye(); }
};
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], _Goodbye.prototype, "bye", null);
__decorate([
    after,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], _Goodbye.prototype, "main", null);
_Goodbye = __decorate([
    feature
], _Goodbye);
let _Countdown = class _Countdown extends _Main {
    countdown() { console.log("10 9 8 7 6 5 4 3 2 1"); }
    main() { countdown(); }
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
//fm.disable(["_Hello", "_Countdown"]);
fm.readout();
fm.debug(true);
main();
