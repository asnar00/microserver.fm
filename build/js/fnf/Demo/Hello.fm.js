// ᕦ(ツ)ᕤ
// /ts/fnf/Demo/Hello.fm.ts
// created from /fnf/Demo/Hello.md
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { feature, def, on, fm } from "../../util/fm.js";
import { _Demo } from "../Demo.fm.js";
let _Hello = class _Hello extends _Demo {
    hello() { fm.log("hello world!"); }
    demo() { hello(); }
    async _test() {
        fm._source("/fnf/Demo/Hello.md");
        fm._assert(await demo(), "you stinka!", 18);
        fm._output(await demo(), 19);
    }
};
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], _Hello.prototype, "hello", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], _Hello.prototype, "demo", null);
_Hello = __decorate([
    feature
], _Hello);
export { _Hello };
//# sourceMappingURL=Hello.fm.js.map