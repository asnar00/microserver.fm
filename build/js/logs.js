let logID = 0;
let logMap = new Map();
class Log {
    constructor() {
        this.lines = [];
    }
}
function taggedFn(name, fn, ...args) {
    let log = new Log();
    logMap.set(name, log);
    const dynamicFunction = async () => { return await fn(...args); };
    Object.defineProperty(dynamicFunction, "name", { value: name });
    return dynamicFunction;
}
function stringify(obj) {
    if (typeof obj === "string") {
        return obj;
    }
    else if (typeof obj === "object") {
        return JSON.stringify(obj);
    }
    else {
        return obj.toString();
    }
}
class LogResult {
    constructor(result, log) {
        this.result = result;
        this.log = log;
    }
}
function log_function(fn, ...args) {
    let name = "__logfn__" + String(logID++);
    let tagged = taggedFn(name, fn, ...args);
    return new LogResult(tagged(), logMap.get(name));
}
function log(...args) {
    let out = args.map((arg) => { return stringify(arg); }).join(" ");
    let err = new Error();
    let stack = err.stack;
    let index = stack.indexOf("__logfn__");
    if (index && index >= 0) {
        let end = stack.indexOf(" ", index);
        let name = stack.substring(index, end);
        let log = logMap.get(name);
        log.lines.push(out);
    }
    else {
        console.log("could not find log name");
    }
}
async function log_wait(results) {
    let promises = results.map((r) => r.result);
    await Promise.all(promises).then(() => {
        console.log("done waiting");
        return;
    });
}
async function doSomething(name) {
    let sleepTime = Math.floor(1000 + Math.random() * 1000);
    log("doSomething: sleeping for", sleepTime, "ms");
    await new Promise((resolve) => setTimeout(resolve, sleepTime));
    log("done sleeping");
    return "hello, " + name;
}
function doSomethingElse(name) {
    log("oh my days");
    return "goodbye, " + name;
}
async function main() {
    console.log("calling both functions");
    let r0 = log_function(doSomething, "asnaroo");
    let r1 = log_function(doSomethingElse, "asnaroo");
    await log_wait([r0, r1]);
    console.log(r0);
    console.log(r1);
}
main();
export {};
//# sourceMappingURL=logs.js.map