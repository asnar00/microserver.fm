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
import * as features from "./fm.ts";
const { Feature, feature, on, after, before, fm, fx } = features;
//-----------------------------------------------------------------------------
let Main = class Main {
    main() {
        console.log("hello world!");
    }
};
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Main.prototype, "main", null);
Main = __decorate([
    feature(Feature)
], Main);
//-----------------------------------------------------------------------------
let Goodbye = class Goodbye {
    kthxbye() {
        console.log("kthxbye");
    }
    main() {
        fx.kthxbye();
    }
};
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Goodbye.prototype, "kthxbye", null);
__decorate([
    after,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Goodbye.prototype, "main", null);
Goodbye = __decorate([
    feature(Main)
], Goodbye);
//-----------------------------------------------------------------------------
let Countdown = class Countdown {
    countdown() {
        for (let i = 10; i > 0; i--) {
            console.log(i);
        }
    }
    main() {
        fx.countdown();
    }
};
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Countdown.prototype, "countdown", null);
__decorate([
    before,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Countdown.prototype, "main", null);
Countdown = __decorate([
    feature(Main)
], Countdown);
console.log("ᕦ(ツ)ᕤ");
console.log("testing testing");
fm.readout();
