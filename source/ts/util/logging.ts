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
