// ᕦ(ツ)ᕤ
// logging.ts
// basic enough to warrant its own low-level module

//------------------------------------------------------------------------------
// Logging adds "log" and "silent_log";

class TreeLog {
    title: string = "";
    contents: (string|TreeLog)[] = [];
    constructor(title: string) { this.title = title; }
}

export class LogManager {
    root: TreeLog = new TreeLog("log");
    current: TreeLog = this.root;
    stack: TreeLog[] = [ this.current ];
    live: boolean = true;
}

let logManager = new LogManager();

export function log(...args: any[]) {
    let message =  args.map(arg => stringify(arg)).join(' ');
    logManager.current.contents.push(message);
    if (logManager.live) {
        console.log(message);
    }
}

export function log_group(title: string) {
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
        logManager.current = logManager.stack[logManager.stack.length-1];
    }
    if (logManager.live) {
        console.groupEnd();
    }
}

function stringify(arg: any) : string {
    if (typeof arg === 'object') {
        try {
            return JSON.stringify(arg, null, 2);
        } catch (error) {
            return String(arg);
        }
    } else {
        return String(arg);
    }
}   

//------------------------------------------------------------------------------
// async logging

function generateUUIDv4() {
    function randomHexDigit() {
        return Math.floor(Math.random() * 16).toString(16);
    }
    function randomHex(length: number) {
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

export class AsyncLocalStorage<T> {
    private map = new Map<number, T>();
    private id = 0;
  
    async run<R>(store: T, callback: () => R | Promise<R>): Promise<R> {
        const id = ++this.id;
        this.map.set(id, store);
    
        try {
            let result = callback();
            if (result instanceof Promise) { result = await result; }
            console.log("callback-result:", result);
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

const asyncLocalStorage = new AsyncLocalStorage<{ logs: string[] }>();

export function asyncLog(...args: any[]) {
    const store = asyncLocalStorage.getStore();
    if (store) {
        store.logs.push(args.join(' '));
    } else {
        console.log(...args); // Fallback to default logging if no context
    }
}

export function call_asyncLogged(fn: Function, ...args: any[]) {
    const requestId = generateUUIDv4();
    const context = { requestId, logs: [] };
    return asyncLocalStorage.run(context, async () => {
        try {
            let result = await fn(...args);
            console.log(`Request ${requestId} completed with result:`, result);
            console.log(`Request ${requestId} logs:`, context.logs.join('\n'));
            return { result: result, log: context.logs.join('\n') };
        } catch (error) {
            asyncLog("Error:", error);
        }
    });
}