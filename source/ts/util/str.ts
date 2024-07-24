// ᕦ(ツ)ᕤ
// str.ts
// time-stamped sequence of values, possibly more than one value at a given time


class str<T> {
    t: number = 0;
    vs: (T | str<T>)[] =[];
    constructor(v: (T | str<T> | null) =null, t: number=0) {
        this.t = t; if (v) this.vs.push(v);
    }
    push(v: T | str<T>) {
        this.vs.push(new str<T>(v, performance.now()));
    }
    join(v: str<T>) {
        if (this.vs.length == 0) { this.push(v); return; }
        const last = this.vs[this.vs.length-1];
        if (last instanceof str) { last.push(v); }
    }
}

let out$ : str<string> = new str<string>();

out$.push("10 9 8 7 6 5 4 3 2 1");
out$.push("hello world");
out$.push("kthxbye.");