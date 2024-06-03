// ᕦ(ツ)ᕤ
// browser.ts
// utility functions to do things to the browser
// a place to hide lots of stupid platform-specific code
// non-extendable
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// get service workers set up so we can run offline
export function setupServiceWorker() {
    return __awaiter(this, void 0, void 0, function* () {
        if ('serviceWorker' in navigator) {
            try {
                let registration = yield navigator.serviceWorker.getRegistration();
                if (registration) {
                }
                else {
                    yield navigator.serviceWorker.register('/service-worker.js');
                    registration = yield navigator.serviceWorker.getRegistration();
                    if (registration) {
                    }
                    else {
                        return 'offline mode unavailable: registration failed.';
                    }
                }
                registration.onupdatefound = () => {
                    const installingWorker = registration.installing;
                    installingWorker.onstatechange = () => {
                        if (installingWorker.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                return 'New or updated service worker is installed.';
                            }
                            else {
                                return 'Service worker is installed for the first time.';
                            }
                        }
                    };
                };
                registration.update();
                return 'success';
            }
            catch (err) {
                return 'offline mode unavailable:' + err;
            }
        }
        else {
            return 'offline mode unavailable: service workers not supported';
        }
    });
}
