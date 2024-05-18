// ᕦ(ツ)ᕤ
// hello.fm.ts
// feature modular hello world

import { Feature, feature, on, after, before, fm, console_separator} from "./fm.ts";

//-----------------------------------------------------------------------------
// Main

declare const main: () => void;

@feature class Main extends Feature {
    @on main() { console.log("ᕦ(ツ)ᕤ"); }
}

//-----------------------------------------------------------------------------
// Hello

declare const hello: (name: string) => void;

@feature class Hello extends Main {
    @on hello() { console.log("hello world"); }
    @on main() { hello("asnaroo"); }
}

//-----------------------------------------------------------------------------
// Goodbye

declare const bye: () => void;

@feature class Goodbye extends Main {
    @on bye() { console.log("kthxbye"); }
    @after main() { bye(); }
}

//-----------------------------------------------------------------------------
// Countdown

declare const countdown: () => void;

@feature class Countdown extends Main {
    @on countdown() { console.log("10 9 8 7 6 5 4 3 2 1"); }
    @before main() { countdown(); }
}

console_separator();
//fm.disable(["Hello", "Countdown"]);
fm.readout();
fm.debug(true);
console_separator();
main();
