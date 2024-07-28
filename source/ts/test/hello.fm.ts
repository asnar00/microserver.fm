// ᕦ(ツ)ᕤ
// hello.fm.ts
// feature modular hello world

import { _Feature, feature, on, after, before, fm } from "../util/fm.ts";

//-----------------------------------------------------------------------------
// Main

declare const main: () => void;

@feature class _Main extends _Feature {
    @on main() { console.log("ᕦ(ツ)ᕤ"); }
}

//-----------------------------------------------------------------------------
// Hello

declare const hello: (name: string) => void;

@feature class _Hello extends _Main {
    @on hello() { console.log("hello world"); }
    @on main() { hello("asnaroo"); }
}

//-----------------------------------------------------------------------------
// Goodbye

declare const bye: () => void;

@feature class _Goodbye extends _Main {
    @on bye() { console.log("kthxbye"); }
    @after main() { bye(); }
}

//-----------------------------------------------------------------------------
// Countdown

declare const countdown: () => void;

@feature class _Countdown extends _Main {
    @on countdown() { console.log("10 9 8 7 6 5 4 3 2 1"); }
    @before main() { countdown(); }
}

//fm.disable(["_Hello", "_Countdown"]);
fm.readout();
fm.debug(true);
main();
