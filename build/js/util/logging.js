// ᕦ(ツ)ᕤ
// logging.ts
// basic enough to warrant its own low-level module
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//------------------------------------------------------------------------------
// Logging adds "log" and "silent_log";
class TreeLog {
    constructor(title) {
        this.title = "";
        this.contents = [];
        this.title = title;
    }
}
export class LogManager {
    constructor() {
        this.root = new TreeLog("log");
        this.current = this.root;
        this.stack = [this.current];
        this.live = true;
    }
}
let logManager = new LogManager();
export function log(...args) {
    let message = args.map(arg => stringify(arg)).join(' ');
    logManager.current.contents.push(message);
    if (logManager.live) {
        console.log(message);
    }
}
export function log_group(title) {
    let tl = new TreeLog(title);
    logManager.current.contents.push(tl);
    logManager.stack.push(tl);
    if (logManager.live) {
        console.group(title);
    }
}
export function log_end_group() {
    if (logManager.stack.length > 1) {
        logManager.stack.pop();
        logManager.current = logManager.stack[logManager.stack.length - 1];
    }
    if (logManager.live) {
        console.groupEnd();
    }
}
function stringify(arg) {
    if (typeof arg === 'object') {
        try {
            return JSON.stringify(arg, null, 2);
        }
        catch (error) {
            return String(arg);
        }
    }
    else {
        return String(arg);
    }
}
//------------------------------------------------------------------------------
// async logging
function generateUUIDv4() {
    function randomHexDigit() {
        return Math.floor(Math.random() * 16).toString(16);
    }
    function randomHex(length) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += randomHexDigit();
        }
        return result;
    }
    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    // y is one of 8, 9, A, or B
    const uuid = `${randomHex(8)}-${randomHex(4)}-4${randomHex(3)}-${(8 + Math.floor(Math.random() * 4)).toString(16)}${randomHex(3)}-${randomHex(12)}`;
    return uuid;
}
export class AsyncLocalStorage {
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
                console.log("callback-result:", result);
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
const asyncLocalStorage = new AsyncLocalStorage();
export function asyncLog(...args) {
    const store = asyncLocalStorage.getStore();
    if (store) {
        store.logs.push(args.join(' '));
    }
    else {
        console.log(...args); // Fallback to default logging if no context
    }
}
export function call_asyncLogged(fn, ...args) {
    const requestId = generateUUIDv4();
    const context = { requestId, logs: [] };
    return asyncLocalStorage.run(context, () => __awaiter(this, void 0, void 0, function* () {
        try {
            let result = yield fn(...args);
            console.log(`Request ${requestId} completed with result:`, result);
            console.log(`Request ${requestId} logs:`, context.logs.join('\n'));
            return { result: result, log: context.logs.join('\n') };
        }
        catch (error) {
            asyncLog("Error:", error);
        }
    }));
}
