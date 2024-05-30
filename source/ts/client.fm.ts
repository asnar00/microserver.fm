// ᕦ(ツ)ᕤ
// client.fm.ts
// feature-modular server
// author: asnaroo

import { _Feature, feature, on, after, before, fm, console_separator }  from "./fm.js";
import { load_shared } from "./shared.fm.js";

//-----------------------------------------------------------------------------
// _Client doesn't do much

declare const client: () => Promise<void>;

@feature class _Client extends _Feature {
    @on async client() { 
        console.log("ᕦ(ツ)ᕤ client"); 
        load_shared();
        fm.readout();
        fm.listModuleScopeFunctions();
    }
}

addEventListener("load", () => { client(); });