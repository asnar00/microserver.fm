
// one or more values at time t
class tval<T> {
    values : T[] = [];
    t: number;
    constructor(t: number) {
        this.t = t;
    }
    push(value: T) {
        this.values.push(value);
    }
}

// tseq is a sequence of tvals at different times
class tseq<T> {
    tvals: tval<T>[] = [];
}

Yeah anyway something like that.