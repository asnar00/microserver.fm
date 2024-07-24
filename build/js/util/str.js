"use strict";
// ᕦ(ツ)ᕤ
// str.ts
// time-stamped sequence of values, possibly more than one value at a given time
class str {
    constructor(v = null, t = 0) {
        this.t = 0;
        this.vs = [];
        this.t = t;
        if (v)
            this.vs.push(v);
    }
    push(v) {
        this.vs.push(new str(v, performance.now()));
    }
    join(v) {
        if (this.vs.length == 0) {
            this.push(v);
            return;
        }
        const last = this.vs[this.vs.length - 1];
        if (last instanceof str) {
            last.push(v);
        }
    }
}
let out$ = new str();
out$.push("10 9 8 7 6 5 4 3 2 1");
out$.push("hello world");
out$.push("kthxbye.");
//# sourceMappingURL=str.js.map