// ᕦ(ツ)ᕤ
// shared.fm.ts
// feature-modular experiments
// author: asnaroo

import { _Feature, feature, def, replace, on, after, before, struct, make, fm}  from "./util/fm.js";

//-----------------------------------------------------------------------------
// Run

export const load_module = () => {};

//-----------------------------------------------------------------------------
// _Shared introduces three stub functions: startup, run, and shutdown

export declare const startup: () => void;
export declare const run: () => void;
export declare const shutdown: () => void;

@feature class _Shared extends _Feature {
    @def async startup() {}
    @def async run() {}
    @def async shutdown() {}
}

//-----------------------------------------------------------------------------
// Devices : things like servers, laptops, phones, drones, etc.
// a Device is accessible via network; has URL and port.
// you can check if it's accessible, and call functions remotely on it.

@struct export class Device { url: string = ""; port: number = 0; }

export declare const stub: () => boolean;
export declare const ping: (d: Device) => Promise<boolean>;
export declare const remote: (d: Device, targetFunction: Function) => Function;

declare const rpc: (d: Device, functionName: string, params: any) => Promise<any>;

@feature class _Device extends _Feature {
    @def stub() : boolean { log("inside stub, returning", true); return true; }
    @def async ping(d: Device) : Promise<boolean> {
        try {
            return remote(d, stub)();
        } catch(e) {
            return false; 
        }
    }
    @def remote(d: Device, targetFunction: Function) {
        let functionName = targetFunction.name;
        if (functionName.startsWith("bound ")) { functionName = functionName.slice(6); }
        const paramNames = fm.getFunctionParams(functionName);
        return new Proxy(targetFunction, {
            apply: async function(target, thisArg, argumentsList) {
                const params : any = {};
                paramNames.forEach((paramName, index) => {
                    params[paramName] = argumentsList[index];
                });
                return rpc(d, functionName, params);
            }
        });
    };
    @def async rpc(d: Device, functionName: string, params: any) {
        const response = await fetch(`${d.url}:${d.port}/${functionName}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const responseData = await response.json();
        const log = responseData.log;
        if (log) {
            log.title = `rpc.${functionName}`;
            log_push(log);
        }
        return responseData.result;
    }
}

//------------------------------------------------------------------------------
// Greet adds a "greet" function that returns a greeting

declare const greet: (name: string) => string;

@feature class _Greet extends _Shared{
    @def greet(name: string): string {
        let result = `hello, ${name}!`;
        console.log("inside greet", name);
        log("tickle it ya wrigglers");
        return result;
    }
    @after async run() {
        const server = make(Device, { url: "http://localhost", port: 8000 });
        log(greet("asnaroo"));
        const msg = await remote(server, greet)("asnaroo");
        log("server:", msg);
    }
}

//------------------------------------------------------------------------------
// Files adds "load" and "save" stubs

declare const load : (filename: string) => string;
declare const save : (filename: string, text: string) => void;

@feature export class _Files extends _Feature {
    @def load(filename: string): string { log("not implemented"); return ""; }
    @def save(filename: string, text: string) { log("not implemented"); }
}
