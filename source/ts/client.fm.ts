// ᕦ(ツ)ᕤ
// client.fm.ts
// feature-modular server
// author: asnaroo

import { _Feature, feature, def, replace, on, after, before, make, fm, }  from "./util/fm.js";
import * as shared from './shared.fm.js';
import * as browser from './util/browser.js';
import { Device } from './shared.fm.js';

addEventListener("load", () => { client(); });

// -----------------------------------------------------------------------------
// declarations from shared module. todo: find a way to automate this. later.
// note: by convention, we can extend shared stuff, but shared can't extend client stuff.

declare const ping: (device: Device) => Promise<boolean>;
declare const startup : () => Promise<void>;
declare const run : () => Promise<void>;
declare const shutdown : () => Promise<void>;

//-----------------------------------------------------------------------------
// _Client runs on the browser

declare const client: () => Promise<void>;
declare const my_test: () => Promise<void>;

@feature class _Client extends _Feature {
    static server = make(Device, { url: "http://localhost", port: 8000 });
    @def async client() { 
        fm.log("ᕦ(ツ)ᕤ client.fm");
        shared.load_module();
        await fm.test();
        await startup();
        await run();
        await shutdown();
        fm.log("done.");
    }
    @after async shutdown() : Promise<void> {}
}

//-----------------------------------------------------------------------------
// _Offline ensures that website can load when offline

declare const setup_offline: () => void;
declare const check_online: () => void;

@feature class _Offline extends _Client {
    static offline: boolean = false;
    @on async startup() { 
        return setup_offline(); 
    }
    @def async check_online() {
        let online = await ping(_Offline.server);
        _Offline.offline = !online;
        if (online) fm.log("connected"); else fm.log("offline");
    }
    @def async setup_offline() {
        let msg = await browser.setupServiceWorker();
        if (msg == "success") { 
            return check_online();
        } else {
            console.log(msg);
        }
    }
}
