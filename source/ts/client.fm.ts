// ᕦ(ツ)ᕤ
// client.fm.ts
// feature-modular server
// author: asnaroo

import * as features from "./fm.js";

const { _Feature, feature, on, after, before, fm, console_separator } = features;

//-----------------------------------------------------------------------------
// Main doesn't do much

declare const client: () => Promise<void>;

@feature class _Main extends _Feature {
    @on async client() { console.log("ᕦ(ツ)ᕤ client"); }
}

addEventListener("load", () => { client(); });