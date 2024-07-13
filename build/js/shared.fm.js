// ᕦ(ツ)ᕤ
// shared.fm.ts
// feature-modular experiments
// author: asnaroo
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _Logging_1;
import { _Feature, feature, def, after, struct, make, nolog, fm } from "./util/fm.js";
//-----------------------------------------------------------------------------
// Run
export const load_module = () => { };
let _Shared = class _Shared extends _Feature {
    async startup() { }
    async run() { }
    async shutdown() { }
};
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], _Shared.prototype, "startup", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], _Shared.prototype, "run", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], _Shared.prototype, "shutdown", null);
_Shared = __decorate([
    feature
], _Shared);
//-----------------------------------------------------------------------------
// _Logging does recursive and async-friendly logging
let LogLine = class LogLine {
    constructor() {
        this.location = ""; // func (file:line:char)
        this.line = ""; // message or sub-log
    }
};
LogLine = __decorate([
    struct
], LogLine);
export { LogLine };
let Log = class Log {
    constructor() {
        this.title = "";
        this.contents = [];
    }
};
Log = __decorate([
    struct
], Log);
export { Log };
let LogManager = class LogManager {
    constructor(log = null) {
        this.current = null;
        this.stack = [];
        if (log) {
            this.current = log;
            this.stack = [log];
        }
        else {
            this.current = make(Log, { title: "main" });
            this.stack = [this.current];
        }
    }
};
LogManager = __decorate([
    struct,
    __metadata("design:paramtypes", [Object])
], LogManager);
export { LogManager };
let LogResult = class LogResult {
};
LogResult = __decorate([
    struct
], LogResult);
export { LogResult };
let _Logging = _Logging_1 = class _Logging extends _Feature {
    // simple output message, tagged with source file and line
    log(...args) {
        const message = args.map(arg => stringify(arg)).join(' ');
        const stack = get_stack();
        const location = get_location(stack);
        const logManager = get_log_manager(stack);
        logManager.current.contents.push(make(LogLine, { location: location, line: message }));
    }
    // start a group of log messages
    log_group(title) {
        const stack = get_stack();
        const logManager = get_log_manager(stack);
        const log = make(Log, { title: title });
        log_push(log, logManager.current, get_location(stack));
        logManager.stack.push(log);
        logManager.current = log;
        return log;
    }
    // end the current group, optionally adding information to the title
    log_end_group(suffix = "") {
        const stack = get_stack();
        const logManager = get_log_manager(stack);
        const log = logManager.current;
        log.title += suffix;
        logManager.stack.pop();
        logManager.current = logManager.stack[logManager.stack.length - 1];
    }
    // run an async function, returning result and log generated
    async log_async(fn, ...args) {
        let name = "__asynclog__" + String(_Logging_1.logID++);
        let tagged = tagged_function(name, fn, ...args);
        let result = await tagged();
        let lr = new LogResult();
        lr.result = result;
        lr.log = _Logging_1.logMap.get(name).stack[0];
        return lr;
    }
    // print 
    log_print(sourceFolder = "", log = null, indent = 0) {
        if (!log) {
            log = log_get();
        }
        let maxLen = 60;
        for (let line of log.contents) {
            const start = " ".repeat(indent);
            let out = ((typeof line.line === "string") ? `${start}${line.line}` : `${start}${line.line.title} ▼`);
            const location = line.location.replace(sourceFolder, "");
            if (location != "") {
                out += " ".repeat(Math.max(4, maxLen - out.length));
                out += console_grey("   ◀︎ " + location);
            }
            console.log(out);
            if (typeof line.line !== "string") {
                log_print(sourceFolder, line.line, indent + 2);
            }
        }
    }
    //-------------------------------------------------------------------------
    // internal
    // push a log to a parent log
    log_push(log, toLog, location = "") {
        if (log) {
            const line = make(LogLine, { location: location, line: log });
            toLog.contents.push(line);
        }
    }
    // get the current log from the stack
    log_get() {
        const stack = get_stack();
        return get_log_manager(stack).stack[0];
    }
    // color a string grey (when sent to console.log)
    console_grey(str) {
        return `\x1b[48;5;234m\x1b[30m${str}\x1b[0m`;
    }
    // gets the current stack as an array of lines
    get_stack() {
        let err = new Error();
        let stack = err.stack;
        let result = stack.split("\n    at ").slice(3);
        return result;
    }
    // given the stack as line-array, return source file/line of log call
    get_location(stack) {
        let index = stack.findIndex((line) => !line.includes("/fm.ts"));
        if (index >= 0 && index < stack.length) {
            return stack[index];
        }
        return "";
    }
    // given the stack as line-array, find the current async log manager, or default if none
    get_log_manager(stack) {
        if (_Logging_1.logMap.size > 0) {
            const index = stack.findIndex((line) => line.includes("__asynclog__"));
            if (index && index >= 0) {
                const si = stack[index];
                const end = si.indexOf(" ");
                const name = si.substring(0, end);
                return _Logging_1.logMap.get(name);
            }
        }
        return _Logging_1.defaultLogManager;
    }
    // given a function and args, return a uniquely named async function that calls it
    tagged_function(name, fn, ...args) {
        const logManager = new LogManager();
        logManager.current.title = fm.getFunctionName(fn) || "undefined";
        _Logging_1.logMap.set(name, logManager);
        const dynamicFunction = async () => {
            const result = await fn(...args);
            return result;
        };
        Object.defineProperty(dynamicFunction, "name", { value: name });
        return dynamicFunction;
    }
    // convert an arbitrary object or value to a string
    stringify(arg) {
        if (typeof arg === 'object') {
            try {
                return JSON.stringify(arg, null, 2);
            }
            catch (error) { }
        }
        return String(arg);
    }
};
_Logging.logMap = new Map();
_Logging.logID = 0;
_Logging.defaultLogManager = new LogManager();
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], _Logging.prototype, "log", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Log)
], _Logging.prototype, "log_group", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], _Logging.prototype, "log_end_group", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Object]),
    __metadata("design:returntype", Promise)
], _Logging.prototype, "log_async", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], _Logging.prototype, "log_print", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Log, String]),
    __metadata("design:returntype", void 0)
], _Logging.prototype, "log_push", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Log)
], _Logging.prototype, "log_get", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", String)
], _Logging.prototype, "console_grey", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], _Logging.prototype, "get_stack", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", String)
], _Logging.prototype, "get_location", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", LogManager)
], _Logging.prototype, "get_log_manager", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Function, Object]),
    __metadata("design:returntype", void 0)
], _Logging.prototype, "tagged_function", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", String)
], _Logging.prototype, "stringify", null);
_Logging = _Logging_1 = __decorate([
    nolog,
    feature
], _Logging);
//-----------------------------------------------------------------------------
// Devices : things like servers, laptops, phones, drones, etc.
// a Device is accessible via network; has URL and port.
// you can check if it's accessible, and call functions remotely on it.
let Device = class Device {
    constructor() {
        this.url = "";
        this.port = 0;
    }
};
Device = __decorate([
    struct
], Device);
export { Device };
let _Device = class _Device extends _Feature {
    stub() { log("inside stub, returning", true); return true; }
    async ping(d) {
        try {
            return remote(d, stub)();
        }
        catch (e) {
            return false;
        }
    }
    remote(d, targetFunction) {
        let functionName = targetFunction.name;
        if (functionName.startsWith("bound ")) {
            functionName = functionName.slice(6);
        }
        const paramNames = fm.getFunctionParams(functionName);
        return new Proxy(targetFunction, {
            apply: async function (target, thisArg, argumentsList) {
                const params = {};
                paramNames.forEach((paramName, index) => {
                    params[paramName] = argumentsList[index];
                });
                return rpc(d, functionName, params);
            }
        });
    }
    ;
    async rpc(d, functionName, params) {
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
            log_push(log, get_log_manager(get_stack()).current);
        }
        return responseData.result;
    }
};
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Boolean)
], _Device.prototype, "stub", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Device]),
    __metadata("design:returntype", Promise)
], _Device.prototype, "ping", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Device, Function]),
    __metadata("design:returntype", void 0)
], _Device.prototype, "remote", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Device, String, Object]),
    __metadata("design:returntype", Promise)
], _Device.prototype, "rpc", null);
_Device = __decorate([
    feature
], _Device);
let _Greet = class _Greet extends _Shared {
    greet(name) {
        let result = `hello, ${name}!`;
        console.log("inside greet", name);
        log("tickle it ya wrigglers");
        return result;
    }
    async run() {
        const server = make(Device, { url: "http://localhost", port: 8000 });
        log(greet("asnaroo"));
        const msg = await remote(server, greet)("asnaroo");
        log("server:", msg);
    }
};
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", String)
], _Greet.prototype, "greet", null);
__decorate([
    after,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], _Greet.prototype, "run", null);
_Greet = __decorate([
    feature
], _Greet);
let _Files = class _Files extends _Feature {
    load(filename) { log("not implemented"); return ""; }
    save(filename, text) { log("not implemented"); }
};
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", String)
], _Files.prototype, "load", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], _Files.prototype, "save", null);
_Files = __decorate([
    feature
], _Files);
export { _Files };
//# sourceMappingURL=shared.fm.js.map