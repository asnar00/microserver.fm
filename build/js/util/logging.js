// ᕦ(ツ)ᕤ
// logging.ts
// basic enough to warrant its own low-level module
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
