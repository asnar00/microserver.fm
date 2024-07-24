// ᕦ(ツ)ᕤ
// /ts/fnf/Demo/Goodbye.fm.ts
// created from /fnf/Demo/Goodbye.md
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { feature, def, after, fm } from "../../util/fm.js";
import { _Demo } from "../Demo.fm.js";
let _Goodbye = class _Goodbye extends _Demo {
    goodbye() { fm.log("kthxbye."); }
    demo() { goodbye(); }
    async _test() {
        fm._source("/fnf/Demo/Goodbye.md");
    }
};
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], _Goodbye.prototype, "goodbye", null);
__decorate([
    after,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], _Goodbye.prototype, "demo", null);
_Goodbye = __decorate([
    feature
], _Goodbye);
export { _Goodbye };
//# sourceMappingURL=Goodbye.fm.js.map