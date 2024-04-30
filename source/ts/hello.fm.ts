
import * as features from "./fm.ts";
const { Feature, feature, on, after, before, fm } = features;

//-----------------------------------------------------------------------------

@feature(Feature) class Main {
    @on main() {
        console.log("hello world!");
    }
}

//-----------------------------------------------------------------------------

@feature(Main) class Goodbye {
    @on kthxbye() {
        console.log("kthxbye");
    }
    @after main() {
        fm.kthxbye();
    }
}

//-----------------------------------------------------------------------------

@feature(Main) class Countdown {
    @on countdown() {
        for (let i=10; i>0; i--) {
            console.log(i);
        }
    }
    @before main() {
        fm.countdown();
    }
}

fm.main();