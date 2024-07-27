var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
function feature(target) {
    console.log(`${target.name} decorated`);
}
let Demo = class Demo {
    constructor() {
        console.log('Demo instance created');
    }
};
Demo = __decorate([
    feature,
    __metadata("design:paramtypes", [])
], Demo);
export { Demo };
export function loadModule() {
    console.log("demo.loadModule");
}
console.log("Demo loaded");
//# sourceMappingURL=test_demo.fm.js.map