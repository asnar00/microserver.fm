// ᕦ(ツ)ᕤ
// client.fm.ts
// feature-modular server
// author: asnaroo

import { _Feature, feature, on, after, before, fm, console_separator }  from "./fm.js";
import * as shared from './shared.fm.js';

// -----------------------------------------------------------------------------
// declarations from shared module. todo: find a way to automate this. later.

declare const doSomething: () => void;

//-----------------------------------------------------------------------------
// _Client runs on the browser

declare const client: () => Promise<void>;

@feature class _Client extends _Feature {
    @on async client() { 
        console.log("ᕦ(ツ)ᕤ client"); 
        fm.readout();
        fm.listModuleScopeFunctions();
        shared.load();
        doSomething();
    }
}

//-----------------------------------------------------------------------------
// _Offline ensures that website can load when offline

declare const setup: () => void;
declare const isServerAccessible: (url: string) => Promise<boolean>;

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
                    else 
                        console.log('  registration failed.');
                }
            } catch (err) {
                console.log('  registration failed:', err);
            }
          } else {
            console.log('  Service workers are not supported! Offline mode disabled.');
        }
    }

    @on async isServerAccessible(url: string): Promise<boolean> {
        try {
            // Add a unique query parameter to the URL to bypass the service worker cache
            const fetchUrl = `${url}/amiup.json`;
            const response = await fetch(fetchUrl, {
                method: 'GET',
                cache: 'no-store',
            });
            return true;    // if it gets here, we're good
        } catch (error) {
            return false;
        }
    }

    @after async client() { 
        await setup(); 
        let online = await isServerAccessible("http://localhost:8000");
        _Offline.offline = !online;
        if (online) console.log("  connected"); else console.log("  offline");
    }
}

addEventListener("load", () => { client(); });

