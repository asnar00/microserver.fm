// ᕦ(ツ)ᕤ
// shared.fm.ts
// feature-modular experiments
// author: asnaroo

import { _Feature, feature, on, after, before, fm, console_separator }  from "./fm.js";

//-----------------------------------------------------------------------------
// Run

export const load_shared = () => {};
export const run = () => { console.log("shared run!"); };

//-----------------------------------------------------------------------------
// Do Something

declare const doSomething : () => void;

@feature class _DoSomething extends _Feature {
    @on doSomething() { console.log("doSomething"); }
}
