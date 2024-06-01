// ᕦ(ツ)ᕤ
// shared.fm.ts
// feature-modular experiments
// author: asnaroo

import { _Feature, feature, on, after, before, struct}  from "./fm.js";

//-----------------------------------------------------------------------------
// Run

export const load = () => { console.log("loaded shared module"); };

//-----------------------------------------------------------------------------
// Do Something

export declare const run: () => void;

@feature class _DoSomething extends _Feature {
     @on run() { console.log("shared run"); }
}

//-----------------------------------------------------------------------------
// Devices : things like servers, laptops, phones, drones, etc.
// a Device is accessible via network; has URL and port.
// you can check if it's accessible, and call functions remotely on it.

@struct export class Device { url: string = ""; port: number = 0; }

export declare const device_accessible: (d: Device) => Promise<boolean>;
export declare const device_proxy: (d: Device, targetFunction: Function) => Function;

@feature class _Device extends _Feature {
    @on async device_accessible(d: Device) : Promise<boolean> {
        try {
            const fetchUrl = `${d.url}:${d.port}`; // or some non-cached path
            await fetch(fetchUrl, { method: 'PUT', cache: 'no-store', body: "{}"});
            return true;    // if it gets here, we're good
        } catch (error) {
            return false;
        }
    }
    @on device_proxy(d: Device, targetFunction: Function) {
        const functionName = targetFunction.name;
        return new Proxy(targetFunction, {
            apply: async function(target, thisArg, argumentsList) {
                const params : any = {};
                const paramNames = target.toString().match(/\(([^)]*)\)/)![1].split(',').map(param => param.trim());
                paramNames.forEach((paramName, index) => {
                    params[paramName] = argumentsList[index];
                });
                const response = await fetch(`${d.url}:${d.port}/${functionName}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(params)
                });
      
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
      
                const responseData = await response.json();
                return responseData.result;
            }
        });
    };
}
