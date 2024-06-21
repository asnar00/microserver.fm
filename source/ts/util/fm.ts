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
    logging: boolean = true;                   // if set, log all calls within this feature
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
    logging: boolean = true;    // logging enabled by default

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

// @nolog decorator handler
export function nolog<T extends { new (...args: any[]): {} }>(constructor: T) {
    const className = constructor.name;
    const mf = MetaFeature._findOrCreate(className);
    if (mf) { mf.logging = false; }
    console.log("turned off logging for", className);
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
// this is super annoying, but it's the only way to call logging functions here
declare class LogLine { location: string; line: string|Log; }
declare class Log { title: string; contents: LogLine[]; }
declare class LogResult<R> { result: R | undefined; log: Log | undefined; }

declare const log_group : (title: string) => Log;
declare const log_end_group : (suffix?: string) => void;
declare const log_async : <R>(fn: Function, ...args: any[]) => Promise<LogResult<R>>;
declare const log_push : (log: Log|undefined, toLog: Log) => void;

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
            if (this.isDebugging && mf.logging) {
                newFunction = this.logFunction(mf, mfn, newFunction);
            }
            this.replaceModuleScopeFunction(mfn.name, newFunction);
        }
    }

    // returns a function wrapping the original function with logging calls
    logFunction(mf: MetaFeature, mfn: MetaFunction, func: Function) : Function {
        if (mfn.isAsync) {
            return async function (...args: any[]) {
                let parentLog = log_group(mfn.name);
                const result = await log_async(func, ...args);
                log_push(result.log, parentLog);
                log_end_group();
                return result.result;
            };
        } else {
            return function (...args: any[]) {
                log_group(mfn.name);
                const result = func(...args);
                log_end_group();
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
}

export const fm = new FeatureManager();
