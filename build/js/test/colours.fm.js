// ᕦ(ツ)ᕤ
// colours.fm.ts
// feature modular struct extension
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { _Feature, feature, on, struct, extend, make } from "../fm.js";
// -----------------------------------------------------------------------------
let Colour = class Colour {
    constructor() {
        this.r = 0;
        this.g = 0;
        this.b = 0;
    }
};
Colour = __decorate([
    struct
], Colour);
let _Colour = class _Colour extends _Feature {
    add_colours(c1, c2) {
        return make(Colour, { r: c1.r + c2.r, g: c1.g + c2.g, b: c1.b + c2.b });
    }
    main() {
        const rgb1 = make(Colour, { r: 1, b: 2 });
        const rgb2 = make(Colour, { r: 0, g: 2 });
        const rgb3 = add_colours(rgb1, rgb2);
        console.log("rgb3", rgb3);
    }
};
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Colour, Colour]),
    __metadata("design:returntype", Colour)
], _Colour.prototype, "add_colours", null);
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], _Colour.prototype, "main", null);
_Colour = __decorate([
    feature
], _Colour);
let Alpha = class Alpha {
    constructor() {
        this.a = 0.5;
    }
};
Alpha = __decorate([
    extend(Colour)
], Alpha);
let _AlphaColour = class _AlphaColour extends _Colour {
    add_colours(c1, c2) {
        return { ...this.existing(add_colours)(c1, c2), a: c1.a + c2.a };
    }
};
__decorate([
    on,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Colour, Colour]),
    __metadata("design:returntype", Colour)
], _AlphaColour.prototype, "add_colours", null);
_AlphaColour = __decorate([
    feature
], _AlphaColour);
main();
//# sourceMappingURL=colours.fm.js.map