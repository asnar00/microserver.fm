// ᕦ(ツ)ᕤ
// client.fm.ts
// feature-modular server
// author: asnaroo

import { _Feature, feature, on, after, before, make, fm, console_separator }  from "./fm.js";
import * as shared from './shared.fm.js';
import { Device } from './shared.fm.js';

addEventListener("load", () => { client(); });

// -----------------------------------------------------------------------------
// declarations from shared module. todo: find a way to automate this. later.

declare const log: (...args: any[]) => void;
declare const ping: (device: Device) => Promise<boolean>;

//-----------------------------------------------------------------------------
// _Client runs on the browser

declare const client: () => Promise<void>;
declare const startup : () => Promise<void>;
declare const run : () => Promise<void>;
declare const shutdown : () => Promise<void>;

@feature class _Client extends _Feature {
    static server = make(Device, { url: "http://localhost", port: 8000 });
    @on async client() { 
        log("ᕦ(ツ)ᕤ client"); 
        fm.readout();
        fm.listModuleScopeFunctions();
        shared.load_module();
        await startup();
        await run();
        await shutdown();
    }
    @on async startup() : Promise<void> { log("startup"); }
    @on async run() : Promise<void> { log("run"); }
    @on async shutdown() : Promise<void> { log("shutdown"); }
}

//-----------------------------------------------------------------------------
// _Offline ensures that website can load when offline

declare const setupOffline: () => void;
declare const check_online: () => void;

@feature class _Offline extends _Client {
    static offline: boolean = false;
    @after async startup() { 
        await setupOffline(); 
        await check_online();
    }
    @on async check_online() {
        let online = await ping(_Offline.server);
        _Offline.offline = !online;
        if (online) log("connected"); else log("offline");
    }
    @on async setupOffline() {
        if ('serviceWorker' in navigator) {
            try {
                let registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                }
                else {
                    await navigator.serviceWorker.register('/service-worker.js');
                    registration = await navigator.serviceWorker.getRegistration();
                    if (registration) {
                    }
                    else {
                        log('offline mode unavailable: registration failed.');
                        return;
                    }
                }
                registration!.onupdatefound = () => {
                    const installingWorker = registration!.installing;
                    installingWorker!.onstatechange = () => {
                        if (installingWorker!.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                log('New or updated service worker is installed.');
                            } else {
                                log('Service worker is installed for the first time.');
                            }
                        }
                    };
                };
                registration!.update();
            } catch (err) {
                log('offline mode unavailable:', err);
            }
          } else {
            log('offline mode unavailable: service workers not supported');
        }
    }
}
