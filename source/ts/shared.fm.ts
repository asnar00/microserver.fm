// ᕦ(ツ)ᕤ
// shared.fm.ts
// feature-modular experiments
// author: asnaroo

import { _Feature, feature, on, after, before}  from "./fm.js";

//-----------------------------------------------------------------------------
// Run

export const load = () => { console.log("loaded shared module"); };

//-----------------------------------------------------------------------------
// Do Something

export declare const doSomething: () => void;

@feature class _DoSomething extends _Feature {
     @on doSomething() { console.log("modified doSomething"); }
}