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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _Logging_1, _AsyncLogging_1;
import { _Feature, feature, def, replace, after, struct, make, fm } from "./fm.js";
//-----------------------------------------------------------------------------
// Logging
let Log = class Log {
    constructor() {
        this.title = "";
        this.contents = [];
    }
};
Log = __decorate([
    struct
], Log);
let LogManager = class LogManager {
    constructor() {
        this.current = make(Log, { title: "log" });
        this.stack = [this.current];
        this.live = true;
    }
};
LogManager = __decorate([
    struct
], LogManager);
let _Logging = _Logging_1 = class _Logging extends _Feature {
    log(...args) {
        const message = args.map(arg => stringify(arg)).join(' ');
        const logManager = log_get_manager();
        logManager.current.contents.push(message);
        if (logManager.live) {
            console.log(message);
        }
    }
    log_group(title) {
        const logManager = log_get_manager();
        const tl = make(Log, { title: title });
        logManager.current.contents.push(tl);
        logManager.stack.push(tl);
        logManager.current = tl;
        if (logManager.live) {
            console.groupCollapsed(title);
        }
    }
    log_end_group(suffix = "") {
        const logManager = log_get_manager();
        logManager.current.title += suffix;
        if (logManager.stack.length > 1) {
            logManager.stack.pop();
            logManager.current = logManager.stack[logManager.stack.length - 1];
        }
        if (logManager.live) {
            console.groupEnd();
        } // NOTE: live consoles can't amend titles
    }
    log_push(log) {
        const logManager = log_get_manager();
        logManager.current.contents.push(log);
        if (logManager.live) {
            log_output_rec(log);
        }
    }
    log_output() {
        log_output_rec(log_get_manager().stack[0]);
    }
    log_output_rec(log) {
        console.groupCollapsed(log.title);
        log.contents.forEach((content) => {
            if (typeof content === 'string') {
                console.log(content);
            }
            else {
                log_output_rec(content);
            }
        });
        console.groupEnd();
    }
    log_get_manager() {
        return _Logging_1.defaultLogManager;
    }
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
_Logging.defaultLogManager = make(LogManager, {});
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
    __metadata("design:returntype", void 0)
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
    __metadata("design:paramtypes", [Log]),
    __metadata("design:returntype", void 0)
], _Logging.prototype, "log_push", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], _Logging.prototype, "log_output", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Log]),
    __metadata("design:returntype", void 0)
], _Logging.prototype, "log_output_rec", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", LogManager)
], _Logging.prototype, "log_get_manager", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", String)
], _Logging.prototype, "stringify", null);
_Logging = _Logging_1 = __decorate([
    feature
], _Logging);
//-----------------------------------------------------------------------------
// AsyncLogging
let LogResult = class LogResult {
    constructor() {
        this.result = undefined;
        this.log = undefined;
    }
};
LogResult = __decorate([
    struct
], LogResult);
export { LogResult };
class AsyncLocalStorage {
    constructor() {
        this.map = new Map();
        this.id = 0;
    }
    run(store, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = ++this.id;
            this.map.set(id, store);
            try {
                let result = callback();
                if (result instanceof Promise) {
                    result = yield result;
                }
                return result;
            }
            finally {
                this.map.delete(id);
            }
        });
    }
    getStore() {
        const id = this.id;
        return this.map.get(id);
    }
}
let _AsyncLogging = _AsyncLogging_1 = class _AsyncLogging extends _Logging {
    log_async_run(fn, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestId = generateUUIDv4();
            const context = { requestId, logManager: make(LogManager, {}) };
            return _AsyncLogging_1.localStorage.run(context, () => __awaiter(this, void 0, void 0, function* () {
                try {
                    let result = yield fn(...args);
                    return make(LogResult, { result: result, log: context.logManager.stack[0] });
                }
                catch (error) {
                    return make(LogResult, { result: error, log: context.logManager.stack[0] });
                }
            }));
        });
    }
    log_get_manager() {
        const store = _AsyncLogging_1.localStorage.getStore();
        if (store) {
            return store.logManager;
        }
        else {
            return _Logging.defaultLogManager;
        }
    }
    generateUUIDv4() {
        return `${randomHex(8)}-${randomHex(4)}-4${randomHex(3)}-${(8 + Math.floor(Math.random() * 4)).toString(16)}${randomHex(3)}-${randomHex(12)}`;
    }
    randomHex(length) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += randomHexDigit();
        }
        return result;
    }
    randomHexDigit() {
        return Math.floor(Math.random() * 16).toString(16);
    }
};
_AsyncLogging.localStorage = new AsyncLocalStorage();
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Object]),
    __metadata("design:returntype", Promise)
], _AsyncLogging.prototype, "log_async_run", null);
__decorate([
    replace,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", LogManager)
], _AsyncLogging.prototype, "log_get_manager", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], _AsyncLogging.prototype, "generateUUIDv4", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], _AsyncLogging.prototype, "randomHex", null);
__decorate([
    def,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], _AsyncLogging.prototype, "randomHexDigit", null);
_AsyncLogging = _AsyncLogging_1 = __decorate([
    feature
], _AsyncLogging);
//-----------------------------------------------------------------------------
// Run
export const load_module = () => { };
let _Shared = class _Shared extends _Feature {
    startup() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    shutdown() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
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
    stub() { return true; }
    ping(d) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return remote(d, stub)();
            }
            catch (e) {
                return false;
            }
        });
    }
    remote(d, targetFunction) {
        let functionName = targetFunction.name;
        if (functionName.startsWith("bound ")) {
            functionName = functionName.slice(6);
        }
        const paramNames = fm.getFunctionParams(functionName);
        return new Proxy(targetFunction, {
            apply: function (target, thisArg, argumentsList) {
                return __awaiter(this, void 0, void 0, function* () {
                    const params = {};
                    paramNames.forEach((paramName, index) => {
                        params[paramName] = argumentsList[index];
                    });
                    return rpc(d, functionName, params);
                });
            }
        });
    }
    ;
    rpc(d, functionName, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${d.url}:${d.port}/${functionName}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const responseData = yield response.json();
            const log = responseData.log;
            if (log) {
                log.title = `rpc.${functionName}`;
                log_push(log);
            }
            return responseData.result;
        });
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
        log("tickle it ya wrigglers");
        return result;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const server = make(Device, { url: "http://localhost", port: 8000 });
            log(greet("asnaroo"));
            const msg = yield remote(server, greet)("asnaroo");
            log("server:", msg);
        });
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