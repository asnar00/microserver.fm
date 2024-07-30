// ᕦ(ツ)ᕤ
// /ts/fnf/Demo.fm.ts
// created from /fnf/Demo.md
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { _Feature, feature, def, fm } from "../../util/fm.js";
let _Demo = class _Demo extends _Feature {
    demo() { fm.log("ᕦ(ツ)ᕤ"); }
    async _test() {
        fm._source("/fnf/Demo.md");
    }
};
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], _Demo.prototype, "demo", null);
_Demo = __decorate([
    feature
], _Demo);
export { _Demo };
import * as Hello from "./Demo/Hello.fm.js";
import * as Goodbye from "./Demo/Goodbye.fm.js";
import * as Countdown from "./Demo/Countdown.fm.js";
export function _loadModule() {
    console.log("Demo._loadModule");
    Hello._loadModule();
    Goodbye._loadModule();
    Countdown._loadModule();
}
//# sourceMappingURL=Demo.fm.js.map