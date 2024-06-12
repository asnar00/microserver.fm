// ᕦ(ツ)ᕤ
// fm.ts
// author: asnaroo
// feature-modular typescript

//------------------------------------------------------------------------------
// base class of all feature clauses

export class _Feature {
    test() {}
    existing(fn: Function) {
        let name = functionNames.get(fn);
        if (name) {
            const mf = MetaFeature._byname[this.constructor.name];
            return mf.existing[name];
        }
    }
}

//------------------------------------------------------------------------------
// MetaFeature / MetaFunction

// everything there is to know about a Feature
class MetaFeature {
    instance: _Feature|null = null;             // singleton instance
    name: string;                               // name of the feature
    properties: MetaProperty[] = [];            // all the properties we define (with decorators)
    functions: MetaFunction[] = [];             // all the functions we define, including decorators
    existing: any = {};                         // maps function name to existing-function
    parent: MetaFeature | null = null;          // feature we extend
    children: MetaFeature[] = [];               // all features that extend this feature
    enabled: boolean = true;                    // whether this feature is enabled (and children)
    static _all : MetaFeature[] = [];           // all features in declaration order
    static _byname : { [name: string]: MetaFeature } = {}; // map feature name to MetaFeature

    constructor(name: string) {                 // called by all decorators, potentially out of order
        this.name = name;
        MetaFeature._all.push(this);
        MetaFeature._byname[name] = this;
    }

    initialise(parentName: string="", instance: _Feature) {         // called by @feature decorator handler
        this.instance = instance;
        this.parent = MetaFeature._byname[parentName] || null;
        if (this.parent) { this.parent.children.push(this); }
    }

    static _findOrCreate(name: string) {                            // called by all decorators
        let mf = MetaFeature._byname[name];
        if (!mf) { mf = new MetaFeature(name); }
        return mf;
    }

    addFunction(mfn: MetaFunction) {
        this.functions.push(mfn);
        const existingFn = fm.getModuleScopeFunction(mfn.name);
        if (existingFn) {
            this.existing[mfn.name] = existingFn;
        }
    }

    isEnabled() : boolean {
        let parent = this.parent;
        let enabled = this.enabled;
        while(parent && enabled) {
            enabled &&= parent.enabled;
            parent = parent.parent;
        }
        return enabled;
    }
}

// everything there is to know about a function defined inside a feature
class MetaFunction {
    name: string;               // as it appears in global space
    method: Function;           // function (...args: any[]): any
    decorator: string;          // on, after, before
    isAsync: boolean;           // true if the function is async
    returnsValue: boolean;      // true if we return something other than void
    params: string[] = [];      // parameter names  

    static _byName: { [name: string]: MetaFunction } = {};
    constructor(name: string, method: Function, decorator: string) {
        this.name = name;
        this.method = method;
        this.decorator = decorator;
        this.isAsync = isAsyncFunction(method);
        this.returnsValue = returnsValue(method);
        this.params = listParams(method);
        MetaFunction._byName[name] = this; 
    }
}

// everything there is to know about a property defined inside a feature
class MetaProperty {
    name: string;               // as it appears in global space
    constructor(name: string,) {
        this.name = name;
    }
}

let _metaFeature = new MetaFeature("_Feature");
_metaFeature.initialise("", new _Feature());

//------------------------------------------------------------------------------
// decorators

// @feature decorator handler
export function feature<T extends { new (...args: any[]): {} }>(constructor: T) {
    const className = constructor.name;
    const prototype = Object.getPrototypeOf(constructor.prototype);
    const superClassConstructor = prototype ? prototype.constructor : null;
    const superClassName = superClassConstructor ? superClassConstructor.name : 'None';
    if (!className.startsWith("_")) { throw new Error(`Feature class name must start with an underscore: ${className}`); }
    const mf = MetaFeature._findOrCreate(className);
    const instance = new constructor();
    mf.initialise(superClassName, instance as _Feature);
    fm.buildFeature(mf);
}

// @def decorator handler
export function def(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const className = target.constructor.name;
    const mf = MetaFeature._findOrCreate(className);
    mf.addFunction(new MetaFunction(propertyKey, method, "def"));
}

// @replace decorator handler
export function replace(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const className = target.constructor.name;
    const mf = MetaFeature._findOrCreate(className);
    mf.addFunction(new MetaFunction(propertyKey, method, "replace"));
}

// @on decorator handler
export function on(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const className = target.constructor.name;
    const mf = MetaFeature._findOrCreate(className);
    mf.addFunction(new MetaFunction(propertyKey, method, "on"));
}

// @after decorator handler
export function after(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const className = target.constructor.name;
    const mf = MetaFeature._findOrCreate(className);
    mf.addFunction(new MetaFunction(propertyKey, method, "after"));
}

// @before decorator handler
export function before(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const className = target.constructor.name;
    const mf = MetaFeature._findOrCreate(className);
    mf.addFunction(new MetaFunction(propertyKey, method, "before"));
}


//------------------------------------------------------------------------------
// structure extension using Proxy and class trickery

const _initialisers : any = {};

export function struct<T extends { new (...args: any[]): {} }>(constructor: T) {
    _initialisers[constructor.name] = (instance: any, arg: any) => {
        const properties = Object.getOwnPropertyNames(instance);
        properties.forEach((key) => {
            if (arg && arg[key] !== undefined) {
                instance[key] = arg[key];
            }
        });
    };

    const newConstructor = class extends constructor {
        static originalName = constructor.name;
        
        constructor(...args: any[]) {
            super(...args);
            const instance = this as any;
            _initialisers[constructor.name](instance, args[0]);
        }
    };

    // Set the name of the new constructor to be the same as the original
    Object.defineProperty(newConstructor, 'name', { value: constructor.name });
    
    return newConstructor;
}

type Constructor<T = {}> = new (...args: any[]) => T;
export function extend<T extends Constructor>(ExistingClass: T) {
    return function <U extends Constructor>(constructor: U) {
        let initNewClass = (instance: any, args: any) => {
            const newInstance = new constructor();  // construct AdditionalClass
            const properties = Object.getOwnPropertyNames(newInstance);
            properties.forEach((key) => {
                if (args && args[key] !== undefined) {
                    (instance as any)[key] = args[key];
                } else {
                    (instance as any)[key] = (newInstance as any)[key];
                }
            });
        }
        let oldInit = _initialisers[ExistingClass.name];
        _initialisers[ExistingClass.name] = (instance: any, arg: any) => {
            oldInit(instance, arg);
            initNewClass(instance, arg);
        };
        return constructor as U;
    };
}

export function make<T>(Cls: { new (): T }, args: any): T {
    // @ts-ignore
    return new Cls(args);
}

//------------------------------------------------------------------------------
// global function manipulator (warning: affects "global" i.e. module scope)

// Create a global function registry
const functionRegistry: { [key: string]: Function } = {};
const functionNames = new Map<Function, string>();

// Create a Proxy handler
const handler: ProxyHandler<typeof globalThis> = {
    set(target, property, value) {
        if (typeof value === 'function') {
            const name = property as string;
            functionRegistry[name] = value;
            functionNames.set(value, property as string);
        }
        return Reflect.set(target, property, value);
    }
};

// Create a Proxy for globalThis
const proxiedGlobalThis = new Proxy(globalThis, handler);

// returns true if a function is async
type AsyncFunction = (...args: any[]) => Promise<any>;

function isAsyncFunction(fn: Function): fn is AsyncFunction {
    let fnString = fn.toString().trim();
    return (fnString.startsWith("async") || fnString.includes("__awaiter")); // works in deno or js
}

// returns true if the function returns a non-void value
function returnsValue(func: Function): boolean {
    const functionText = func.toString();
    const returnRegex = /return\s+([^;]*)/g;
    let match;
    while ((match = returnRegex.exec(functionText)) !== null) {
        const returnValue = match[1].trim();
        if (returnValue && !returnValue.startsWith("__awaiter")) {
            return true;
        }
    }
    return false;
}

// list the parameter names for (func)
function listParams(func: Function): string[] {
    const funcStr = func.toString();
    const paramStr = funcStr.match(/\(([^)]*)\)/)![1];
    const params = paramStr.split(',').map(param => param.trim().split('=')[0].trim()).filter(param => param);
    return params;
}

//------------------------------------------------------------------------------
// Feature Manager

export class FeatureManager {
    isDebugging: boolean = false;

    // disable one or more features
    disable(featureNames: string[]) {
        for(let mf of MetaFeature._all) {
            mf.enabled = true;
        }
        for(let name of featureNames) {
            let mf = MetaFeature._byname[name];
            if (mf) { mf.enabled = false; }
        }
        this.rebuild();
    }

    // output current feature tree to console
    readout(mf: MetaFeature|null=null, indent=0) {
        if (!mf) {  
            mf = MetaFeature._byname["_Feature"]; 
            console.log("Defined features:");
        }
        if (mf.isEnabled()) {
            console.log(`${" ".repeat(indent)}${mf.name}`);
            for (let c of mf.children) {
                this.readout(c, indent+2);
            }
        } else {
            console.log(mf.name, "(disabled)");
        }
    }

    // turn logging off or on for all features
    debug(onOff: boolean) {
        this.isDebugging = onOff;
        this.rebuild();
    }

    // rebuild all features
    rebuild() {
        this.clearModuleScopeFunctions();
        for(let mf of MetaFeature._all) {
            if (mf.isEnabled()) { this.buildFeature(mf); }
        }
    }

    // build all functions for a feature
    buildFeature(mf: MetaFeature) {
        for(let mfn of mf.functions) { 
            let newFunction = this.buildFunction(mf, mfn);
            Object.defineProperty(newFunction, "name", { value: mfn.name });
            if (this.isDebugging) {
                newFunction = this.logFunction(mf, mfn, newFunction);
            }
            this.replaceModuleScopeFunction(mfn.name, newFunction);
        }
    }

    // returns a function wrapping the original function with logging calls
    logFunction(mf: MetaFeature, mfn: MetaFunction, func: Function) : Function {
        if (mfn.isAsync) {
            return async function (...args: any[]) {
                let log = fm.logGroup(mfn.name);
                const result = await fm.asyncLog(func, ...args);
                log.contents.push(new LogLine("", result.log));
                fm.endLogGroup();
                return result.result;
            };
        } else {
            return function (...args: any[]) {
                fm.logGroup(mfn.name);
                const result = func(...args);
                fm.endLogGroup();
                return result;
            };
        }
    }

    // build a function based on the MetaFunction
    buildFunction(mf: MetaFeature, mfn: MetaFunction) : Function {
        if (mfn.decorator == "def") { return this.buildDefFunction(mf, mfn); }
        else if (mfn.decorator == "replace") { return this.buildReplaceFunction(mf, mfn); }
        else if (mfn.decorator == "on") { return this.buildOnFunction(mf, mfn); }
        else if (mfn.decorator == "after") { return this.buildAfterFunction(mf, mfn); }
        else if (mfn.decorator == "before") { return this.buildBeforeFunction(mf, mfn); }
        else { throw new Error(`unknown decorator ${mfn.decorator}`); }
    }

    // build a function that defines a new function
    buildDefFunction(mf: MetaFeature, mfn: MetaFunction) : Function {
        const originalFunction = functionRegistry[mfn.name];
        if (originalFunction) {  
            throw new Error(`${mf.name}.def: ${mfn.name} already exists`); 
        }
        const boundMethod = mfn.method.bind(mf.instance);
        return boundMethod;
    }

    // build a function that replaces an existing function with a new one
    buildReplaceFunction(mf: MetaFeature, mfn: MetaFunction) : Function {
        const originalFunction = functionRegistry[mfn.name];
        if (!originalFunction) { throw new Error(`${mf.name}.replace: ${mfn.name} not found`); }
        const boundMethod = mfn.method.bind(mf.instance);
        return boundMethod;
    }

    // build a function that extends the original with a parallel call to the new one
    buildOnFunction(mf: MetaFeature, mfn: MetaFunction) : Function {
        const boundMethod = mfn.method.bind(mf.instance);
        const originalFunction = functionRegistry[mfn.name];
        if (!originalFunction) return boundMethod;
        if (!mfn.isAsync) { throw new Error(`${mf.name}.on: ${mfn.name} must be async`); }
        return async function(...args: any[]) {
            return Promise.all([originalFunction(...args), boundMethod(...args)]);
        };
    }

    // build a function that calls the new function after the original
    buildAfterFunction(mf: MetaFeature, mfn: MetaFunction) : Function {
        const originalFunction = functionRegistry[mfn.name];
        if (!originalFunction) { throw new Error(`${mf.name}.after: ${mfn.name} not found`); }
        if (mfn.isAsync) {
            if (!isAsyncFunction(mfn.method)) { throw new Error(`${mf.name}.before: ${mfn.name} must be async`); }
            const newFunction = async function (...args: any[]) {
                let _result = await originalFunction(...args);
                return mfn.method.apply(mf.instance, [...args, _result]);
            };
            return newFunction;
        } else {
            const newFunction = function (...args: any[]) {
                let _result = originalFunction(...args);
                return mfn.method.apply(mf.instance, [...args, _result]);
            };
            return newFunction;
        }
    }

    // build a function that calls the new function before the original
    buildBeforeFunction(mf: MetaFeature, mfn: MetaFunction) : Function {
        const originalFunction = functionRegistry[mfn.name];
        if (!originalFunction) { throw new Error(`${mf.name}.before: ${mfn.name} not found`); }
        if (mfn.isAsync) {
            if (!isAsyncFunction(mfn.method)) { throw new Error(`${mf.name}.before: ${mfn.name} must be async`); }
            const newFunction =  async function (...args: any[]) {
                const newResult = await mfn.method.apply(mf.instance, args);
                if (newResult !== undefined) { return newResult; }
                return originalFunction(...args);
            };
            return newFunction;
        } else {
            const newFunction = function (...args: any[]) {
                const newResult = mfn.method.apply(mf.instance, args);
                if (newResult !== undefined) { return newResult; }
                return originalFunction(...args);
            };
            return newFunction;
        }
    }

    //-------------------------------------------------------------------------
    // low-level function management in module (=global) scope

    // replace a function in module (=global) scope
    replaceModuleScopeFunction(name: string, newFn: Function) {
        if (functionRegistry[name]) {
            (proxiedGlobalThis as any)[name] = newFn;
            functionNames.set(newFn, name);
        } else {
            this.defineModuleScopeFunction(name, newFn);
        }
    }

    // define a function in module (=global) scope
    defineModuleScopeFunction(name: string, fn: Function) {
        (proxiedGlobalThis as any)[name] = fn;
        functionNames.set(fn, name);
    }

    // list all functions in module (=global) scope
    listModuleScopeFunctions() {
        console.log("Defined functions:");
        for(let name of Object.keys(functionRegistry)) {
            console.log("   ", name);
        }
    }

    // clear all functions in module (=global) scope
    clearModuleScopeFunctions() {
        for(let name of Object.keys(functionRegistry)) {
            const fn = (proxiedGlobalThis as any)[name];
            delete (proxiedGlobalThis as any)[name];
            functionNames.delete(fn);
            delete functionRegistry[name];
        }
    }

    // find a function from module (=global) scope by name
    getModuleScopeFunction(name: string) : Function {
        return functionRegistry[name];
    }

    // low-level: get the name of a function
    getFunctionName(fn: Function) : string|undefined {
        let name = fn.name;
        if (name && name != "") { return name; }
        return functionNames.get(fn);
    }

    // low-level: get the parameters of a function
    getFunctionParams(name: string) : string[] {
        return MetaFunction._byName[name].params;
    }

    //-------------------------------------------------------------------------
    // logging

    // simple output message, tagged with source file and line
    log(...args: any[]) {
        const message = args.map(arg => stringify(arg)).join(' ');
        const stack : string[] = get_stack();
        const location = get_location(stack);
        const logManager = get_log_manager(stack);
        logManager.current!.contents.push(new LogLine(location, message));
    }

    // start a group of log messages
    logGroup(title: string) : Log {
        const stack : string[] = get_stack();
        const location = get_location(stack);
        const logManager = get_log_manager(stack);
        const log = new Log(title);
        logManager.current!.contents.push(new LogLine(location, log));
        logManager.stack.push(log);
        logManager.current = log;
        return log;
    }

    // end the current group, optionally adding information to the title
    endLogGroup(suffix: string="") {
        const stack : string[] = get_stack();
        const logManager = get_log_manager(stack);
        const log = logManager.current!;
        log.title += suffix;
        logManager.stack.pop();
        logManager.current = logManager.stack[logManager.stack.length-1];
    }

    async asyncLog<R>(fn: Function, ...args: any[]) : Promise<LogResult<R>> {
        let name = "__asynclog__" + String(s_logID++);
        let tagged = tagged_function(name, fn, ...args);
        let result = await tagged();
        return new LogResult<R>(result, s_logMap.get(name)!.stack[0]);
    }

    getLog() : Log {
        const stack : string[] = get_stack();
        return get_log_manager(stack).stack[0];
    }

    printLog(sourceFolder: string = "", log: Log|null=null, indent = 0) {
        if (!log) { log = this.getLog(); }
        let maxLen = 60;
        for(let line of log.contents) {
            let out = "";
            let start = " ".repeat(indent);
            if (typeof line.line === "string") {
                out = `${start}${line.line}`;
                const spaces = " ".repeat(Math.max(4, maxLen - out.length));
                console.log(out + spaces + console_grey("   ◀︎ " + line.location.replace(sourceFolder, "")));
            } else {
                out = `${start}${line.line.title} ▼`;
                const spaces = " ".repeat(Math.max(4, maxLen - out.length));
                console.log(out + spaces + console_grey("   ◀︎ " + line.location.replace(sourceFolder, "")));
                this.printLog(sourceFolder, line.line, indent+2);
            }
        }
    }
}

export const fm = new FeatureManager();

//------------------------------------------------------------------------------
// logging

export class LogLine {
    location: string = "";        // file:line:char
    line: string|Log = "";        // message or sub-log
    constructor(location: string, line: string|Log) { this.location = location; this.line = line; }
}

export class Log {
    title: string = "";
    contents: LogLine[] = [];
    constructor(title: string) { this.title = title; }
}

export class LogManager {
    current: Log|null = null;
    stack: Log[] = [];
    constructor(log: Log|null=null) { 
        if (log) { this.current = log; this.stack = [log]; } 
        else { this.current = new Log("main"); this.stack = [this.current]; }
    }
}

export class LogResult<R> {
    result: R;
    log: Log;
    constructor(result: R, log: Log) { this.result = result; this.log = log; }
}

const s_logMap = new Map<string, LogManager>();
let s_logID = 0;
const s_defaultLogManager = new LogManager();


//------------------------------------------------------------------------------
// internal

function console_grey(str: string) : string { 
    return `\x1b[48;5;234m\x1b[30m${str}\x1b[0m`; 
}

// gets the current stack as an array of lines
function get_stack() : string[] {
    let err = new Error();
    let stack = err.stack!;
    return stack.split("\n    at ").slice(2);
}

// given the stack as line-array, return source file/line of log call
function get_location(stack: string[]) : string {
    const index = stack.findIndex((line) => !line.includes("/fm.ts"));
    if (index && index >= 0) {
        return stack[index];
    }
    return "";
}

// given the stack as line-array, find the current async log manager, or default if none
function get_log_manager(stack: string[]) : LogManager {
    if (s_logMap.size > 0) {
        const index = stack.findIndex((line) => line.includes("__asynclog__"));
        if (index && index >= 0) {
            const si = stack[index];
            const end = si.indexOf(" ");
            const name = si.substring(0, end);
            return s_logMap.get(name)!;
        }
    }
    return s_defaultLogManager;
}

// given a function and args, return a uniquely named async function that calls it
function tagged_function(name: string, fn: Function, ...args: any[]) {
    const logManager = new LogManager();
    logManager.current!.title = fm.getFunctionName(fn) || "undefined";
    s_logMap.set(name, logManager);
    const dynamicFunction = async () => { 
        const result = await fn(...args); 
        return result;
    }
    Object.defineProperty(dynamicFunction, "name", { value: name });
    return dynamicFunction;
}

// convert an arbitrary object or value to a string
function stringify(arg: any) : string {
    if (typeof arg === 'object') {
        try { return JSON.stringify(arg, null, 2);}
        catch (error) {}
    }
    return String(arg);
}

