// ᕦ(ツ)ᕤ
// browser.ts
// utility functions to do things to the browser
// a place to hide lots of stupid platform-specific code
// non-extendable

// get service workers set up so we can run offline
export async function setupServiceWorker() : Promise<string> {
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
                    return 'offline mode unavailable: registration failed.';
                }
            }
            registration!.onupdatefound = () => {
                const installingWorker = registration!.installing;
                installingWorker!.onstatechange = () => {
                    if (installingWorker!.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            return 'New or updated service worker is installed.';
                        } else {
                            return 'Service worker is installed for the first time.';
                        }
                    }
                };
            };
            registration!.update();
            return 'success';
        } catch (err) {
            return 'offline mode unavailable:' + err;
        }
    } else {
        return 'offline mode unavailable: service workers not supported';
    }
}