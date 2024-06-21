// ᕦ(ツ)ᕤ
// shared.fm.ts
// feature-modular experiments
// author: asnaroo

import { _Feature, feature, def, replace, on, after, before, struct, make, nolog, fm}  from "./util/fm.js";

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
// _Logging does recursive and async-friendly logging

@struct export class LogLine {
    location: string = "";        // func (file:line:char)
    line: string|Log = "";        // message or sub-log
}

@struct export class Log {
    title: string = "";
    contents: LogLine[] = [];
}

@struct export class LogManager {
    current: Log|null = null;
    stack: Log[] = [];
    constructor(log: Log|null=null) { 
        if (log) { this.current = log; this.stack = [log]; } 
        else { this.current = make(Log, { title: "main"}); this.stack = [this.current]; }
    }
}

@struct export class LogResult<R> {
    result: R | undefined;
    log: Log | undefined;
}

// public
export declare const log : (...args: any[]) => void;
export declare const log_group : (title: string) => Log;
export declare const log_end_group : (suffix: string) => void;
export declare const log_async : <R>(fn: Function, ...args: any[]) => Promise<LogResult<R>>;
export declare const log_print : (sourceFolder: string, log: Log, indent: number) => void;

// private
declare const log_push : (log: Log|undefined, toLog: Log, location?: string) => void;
declare const log_get : () => Log;
declare const console_grey : (str: string) => string;
declare const get_stack : () => string[];
declare const get_location : (stack: string[]) => string;
declare const get_log_manager : (stack: string[]) => LogManager;
declare const tagged_function : (name: string, fn: Function, ...args: any[]) => Function;
declare const stringify : (arg: any) => string;

@nolog @feature class _Logging extends _Feature {
    static logMap = new Map<string, LogManager>();
    static logID = 0;
    static defaultLogManager = new LogManager();

    // simple output message, tagged with source file and line
    @def log(...args: any[]) {
        const message = args.map(arg => stringify(arg)).join(' ');
        const stack : string[] = get_stack();
        const location = get_location(stack);
        const logManager = get_log_manager(stack);
        logManager.current!.contents.push(make(LogLine, { location: location, line: message}));
    }

    // start a group of log messages
    @def log_group(title: string) : Log {
        const stack : string[] = get_stack();
        const logManager = get_log_manager(stack);
        const log = make(Log, { title: title});
        log_push(log, logManager.current!, get_location(stack));
        logManager.stack.push(log);
        logManager.current = log;
        return log;
    }

    // end the current group, optionally adding information to the title
    @def log_end_group(suffix: string="") {
        const stack : string[] = get_stack();
        const logManager = get_log_manager(stack);
        const log = logManager.current!;
        log.title += suffix;
        logManager.stack.pop();
        logManager.current = logManager.stack[logManager.stack.length-1];
    }

    // run an async function, returning result and log generated
    @def async log_async<R>(fn: Function, ...args: any[]) : Promise<LogResult<R>> {
        let name = "__asynclog__" + String(_Logging.logID++);
        let tagged = tagged_function(name, fn, ...args);
        let result = await tagged();
        return make(LogResult<R>, { result: result, log: _Logging.logMap.get(name)!.stack[0]});
    }

    // print 
    @def log_print(sourceFolder: string = "", log: Log|null=null, indent = 0) {
        if (!log) { log = log_get(); }
        let maxLen = 60;
        for(let line of log!.contents) {
            const start = " ".repeat(indent);
            let out = start + ((typeof line.line === "string") ? `${start}${line.line}` : `${start}${line.line.title} ▼`);
            const location = line.location.replace(sourceFolder, "");
            if (location != "") {
                out += " ".repeat(Math.max(4, maxLen - out.length));
                out += console_grey("   ◀︎ " + location);
            }
            console.log(out);
            if (typeof line.line !== "string") {
                log_print(sourceFolder, line.line, indent+2);
            }
        }
    }

    //-------------------------------------------------------------------------
    // internal

    // push a log to a parent log
    @def log_push(log: Log|undefined, toLog: Log, location: string ="") {
        if (log) {
            const line = make(LogLine, { location: location, line: log });
            toLog.contents.push(line);
        }
    }

    // get the current log from the stack
    @def log_get() : Log {
        const stack : string[] = get_stack();
        return get_log_manager(stack).stack[0];
    }

    // color a string grey (when sent to console.log)
    @def console_grey(str: string) : string { 
        return `\x1b[48;5;234m\x1b[30m${str}\x1b[0m`; 
    }

    // gets the current stack as an array of lines
    @def get_stack() : string[] {
        let err = new Error();
        let stack = err.stack!;
        let result= stack.split("\n    at ").slice(3);
        return result;
    }

    // given the stack as line-array, return source file/line of log call
    @def get_location(stack: string[]) : string {
        let index = stack.findIndex((line) => !line.includes("/fm.ts"));
        if (index >= 0 && index < stack.length) { return stack[index]; }
        return "";
    }

    // given the stack as line-array, find the current async log manager, or default if none
    @def get_log_manager(stack: string[]) : LogManager {
        if (_Logging.logMap.size > 0) {
            const index = stack.findIndex((line) => line.includes("__asynclog__"));
            if (index && index >= 0) {
                const si = stack[index];
                const end = si.indexOf(" ");
                const name = si.substring(0, end);
                return _Logging.logMap.get(name)!;
            }
        }
        return _Logging.defaultLogManager;
    }

    // given a function and args, return a uniquely named async function that calls it
    @def tagged_function(name: string, fn: Function, ...args: any[]) {
        const logManager = new LogManager();
        logManager.current!.title = fm.getFunctionName(fn) || "undefined";
        _Logging.logMap.set(name, logManager);
        const dynamicFunction = async () => { 
            const result = await fn(...args); 
            return result;
        }
        Object.defineProperty(dynamicFunction, "name", { value: name });
        return dynamicFunction;
    }

    // convert an arbitrary object or value to a string
    @def stringify(arg: any) : string {
        if (typeof arg === 'object') {
            try { return JSON.stringify(arg, null, 2);}
            catch (error) {}
        }
        return String(arg);
    }
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
            log_push(log, get_log_manager(get_stack()).current!);
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
