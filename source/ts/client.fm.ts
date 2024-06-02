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

declare const run: () => void;
declare const ping: (device: Device) => Promise<boolean>;

//-----------------------------------------------------------------------------
// _Client runs on the browser

declare const client: () => Promise<void>;

@feature class _Client extends _Feature {
    static server = make(Device, { url: "http://localhost", port: 8000 });
    @on async client() { 
        console.log("ᕦ(ツ)ᕤ client"); 
        fm.readout();
        fm.listModuleScopeFunctions();
        shared.load();
    }
}

//-----------------------------------------------------------------------------
// _Offline ensures that website can load when offline

declare const setup: () => void;

@feature class _Offline extends _Client {
    static offline: boolean = false;
    @on async setup() {
        console.log("_Offline.setup");
        if ('serviceWorker' in navigator) {
            try {
                let registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    console.log('  already registered with scope:', registration.scope);
                }
                else {
                    await navigator.serviceWorker.register('/service-worker.js');
                    registration = await navigator.serviceWorker.getRegistration();
                    if (registration)
                        console.log('  registration successful with scope:', registration.scope);
                    else {
                        console.log('  registration failed.');
                        return;
                    }
                }

                registration!.onupdatefound = () => {
                    const installingWorker = registration!.installing;
                    installingWorker!.onstatechange = () => {
                        if (installingWorker!.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            console.log('New or updated service worker is installed.');
                        } else {
                            console.log('Service worker is installed for the first time.');
                        }
                        }
                    };
                };
                registration!.update();
            } catch (err) {
                console.log('  registration failed:', err);
            }
          } else {
            console.log('  Service workers are not supported! Offline mode disabled.');
        }
    }

    @after async client() { 
        await setup(); 
        let online = await ping(_Offline.server);
        _Offline.offline = !online;
        if (online) console.log("  connected"); else console.log("  offline");
    }
}

//-----------------------------------------------------------------------------
// Run

@feature class _Run extends _Client {
    @after async client() { run(); }
}