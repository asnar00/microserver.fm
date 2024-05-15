// ᕦ(ツ)ᕤ
// hello.fm.ts
// feature modular hello world

import { Feature, feature, on, after, before, fm} from "./source/ts/fm.ts";

//-----------------------------------------------------------------------------

@feature(Feature) class Main {
    @on main() {}
}

//-----------------------------------------------------------------------------

@feature(Main) class Hello {
    @on hello() {
        console.log("hello world");
    }
    @after main() {
        fm.hello();
    }
}

//-----------------------------------------------------------------------------

@feature(Main) class Goodbye {
    @on bye() {
        console.log("kthxbye");
    }
    @after main() {
        fm.bye();
    }
}

//-----------------------------------------------------------------------------

@feature(Main) class Countdown {
    @on countdown() {
        console.log("10 9 8 7 6 5 4 3 2 1");
    }
    @before main() {
        fm.countdown();
    }
}

console.log("ᕦ(ツ)ᕤ");
fm._manager.readout();

console.log("run: ----------------------------------------");
fm.main();