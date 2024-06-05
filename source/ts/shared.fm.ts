// ᕦ(ツ)ᕤ
// shared.fm.ts
// feature-modular experiments
// author: asnaroo

import { _Feature, feature, def, replace, on, after, before, struct, make, fm}  from "./fm.js";

//-----------------------------------------------------------------------------
// Logging

@struct class Log {
    title: string = "";
    contents: (string|Log)[] = [];
}

@struct class LogManager {
    current: Log = make(Log, { title: "log" });
    stack: Log[] = [this.current];
    live: boolean = true;
}

export declare const log: (...args: any[]) => void;
export declare const log_group: (title: string) => void;
export declare const log_end_group: () => void;
export declare const log_push : (log: Log) => void;
export declare const log_output: () => void;

declare const stringify: (arg: any) => string;
declare const log_get_manager: () => LogManager;
declare const log_output_rec: (log: Log) => void;

@feature class _Logging extends _Feature {
    static defaultLogManager = make(LogManager, {});

    @def log(...args: any[]) {
        const message = args.map(arg => stringify(arg)).join(' ');
        const logManager = log_get_manager();
        logManager.current.contents.push(message);
        if (logManager.live) { console.log(message); }
    }

    @def log_group(title: string) {
        const logManager = log_get_manager();
        const tl = make(Log, { title: title });
        logManager.current.contents.push(tl);
        logManager.stack.push(tl);
        logManager.current = tl;
        if (logManager.live) { console.groupCollapsed(title); }
    }

    @def log_end_group(suffix: string="") {
        const logManager = log_get_manager();
        logManager.current.title += suffix;
        if (logManager.stack.length > 1) {
            logManager.stack.pop();
            logManager.current = logManager.stack[logManager.stack.length-1];
        }
        if (logManager.live) { console.groupEnd(); }    // NOTE: live consoles can't amend titles
    }

    @def log_push(log: Log) {
        const logManager = log_get_manager();
        logManager.current.contents.push(log);
        if (logManager.live) { log_output_rec(log); }
    }

    @def log_output() {
        log_output_rec(log_get_manager().stack[0]);
    }

    @def log_output_rec(log: Log) {
        console.groupCollapsed(log.title);
        log.contents.forEach((content) => {
            if (typeof content === 'string') { console.log(content); }
            else { log_output_rec(content); }
        });
        console.groupEnd();
    }

    @def log_get_manager() : LogManager {
        return _Logging.defaultLogManager;
    }

    @def stringify(arg: any) : string {
        if (typeof arg === 'object') {
            try { return JSON.stringify(arg, null, 2);}
            catch (error) {}
        }
        return String(arg);
    }   
}
//-----------------------------------------------------------------------------
// AsyncLogging

@struct export class LogResult {
    result: any = undefined;
    log: Log|undefined = undefined;
}

class AsyncLocalStorage<T> {
    private map = new Map<number, T>();
    private id = 0;
  
    async run<R>(store: T, callback: () => R | Promise<R>): Promise<R> {
        const id = ++this.id;
        this.map.set(id, store);
    
        try {
            let result = callback();
            if (result instanceof Promise) { result = await result; }
            return result;
        } finally {
            this.map.delete(id);
        }
    }
  
    getStore() {
        const id = this.id;
        return this.map.get(id);
    }
}

export declare const log_async_run : (fn: Function, ...args: any[]) => Promise<LogResult>;
declare const generateUUIDv4: () => string;
declare const randomHex: (length: number) => string;
declare const randomHexDigit: () => string;

@feature class _AsyncLogging extends _Logging {
    static localStorage = new AsyncLocalStorage<{ logManager: LogManager }>();
    @def async log_async_run(fn: Function, ...args: any[]) : Promise<LogResult> {
        const requestId = generateUUIDv4();
        const context = { requestId, logManager: make(LogManager, {}) };
        return _AsyncLogging.localStorage.run(context, async () => {
            try {
                let result : any = await fn(...args);
                return make(LogResult, { result: result, log: context.logManager.stack[0] });
            } catch (error) {
                return make(LogResult, { result: error, log: context.logManager.stack[0] });
            }
        });
    }

    @replace log_get_manager() : LogManager {
        const store = _AsyncLogging.localStorage.getStore();
        if (store) { return store.logManager; } 
        else { return _Logging.defaultLogManager; }
    }

    @def generateUUIDv4() {
        return  `${randomHex(8)}-${randomHex(4)}-4${randomHex(3)}-${(8 + Math.floor(Math.random() * 4)).toString(16)}${randomHex(3)}-${randomHex(12)}`;
    }

    @def randomHex(length: number) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += randomHexDigit();
        }
        return result;
    }

    @def randomHexDigit() {
        return Math.floor(Math.random() * 16).toString(16);
    }
}

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
    @def stub() : boolean { return true; }
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
