// ᕦ(ツ)ᕤ
// fm.ts
// author: asnaroo
// feature-modular typescript

//------------------------------------------------------------------------------
// logging

let _indent: string = "";   // start of each console for indenting
let _suffix: string = "";   // at the end of each console line, print this in grey
let _stack: string[] = [];  // current callstack
let _width: number = 80;    // width of the console

function formatLog(...args: any[]): string {
    // Convert all arguments to strings and handle objects specifically
    let outstr = args.map(arg => {
        if (typeof arg === 'object') {
            // Use JSON.stringify to convert objects to strings
            try {
                return JSON.stringify(arg, null, 2);
            } catch (error) {
                return String(arg);
            }
        } else {
            // Convert non-objects to strings directly
            return String(arg);
        }
    }).join(' '); // Join all parts with a space, similar to how console.log does
    if (_suffix != "") {
        let crstr = "";
        while(outstr.length >= _width) {
            crstr += outstr.slice(0, _width) + "\n";
            outstr = outstr.slice(_width);
        }
    
        let nSpaces = _width - outstr.length - _suffix.length 
        if (nSpaces > 0) {
            crstr += outstr + " ".repeat(nSpaces);
            crstr += console_grey(_suffix);
        } else {
            crstr += outstr + "\n";
            crstr += " ".repeat(_width - _suffix.length) + console_grey(_suffix);
        }
        return crstr;
    }
    return outstr;
}

const originalConsoleLog = console.log;     // Store the original console.log function
console.log = (...args) => {                // Override console.log
    originalConsoleLog(_indent + formatLog(...args)); 
};
export const console_indent = () => { _indent += "  "; };  // Add two spaces to the indentation
export const console_undent = () => { _indent = _indent.slice(0, -2); };  // Remove two spaces from the indentation
export const console_separator = () => { console.log("-".repeat(_width)); };  // Print a separator line
export function console_grey(str: string) : string { return `\x1b[48;5;234m\x1b[30m${str}\x1b[0m`; }

//------------------------------------------------------------------------------
// base class of all feature clauses

export class _Feature {
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
    params: string[] = [];      // parameter names  

    static _byName: { [name: string]: MetaFunction } = {};
    constructor(name: string, method: Function, decorator: string) {
        this.name = name;
        this.method = method;
        this.decorator = decorator;
        this.isAsync = isAsyncFunction(method);
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
            functionRegistry[property as string] = value;
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

    readout(mf: MetaFeature|null=null) {
        if (!mf) {  
            mf = MetaFeature._byname["_Feature"]; 
            console.log("Defined features:");
        }
        if (mf.isEnabled()) {
            console.log(mf.name);
            console_indent();
            for (let c of mf.children) {
                this.readout(c);
            }
            console_undent();
        } else {
            console.log(console_grey(mf.name));
        }
    }

    debug(onOff: boolean) {
        this.isDebugging = onOff;
        this.rebuild();
    }

    rebuild() {
        this.clearModuleScopeFunctions();
        for(let mf of MetaFeature._all) {
            if (mf.isEnabled()) { this.buildFeature(mf); }
        }
    }

    buildFeature(mf: MetaFeature) {
        for(let mfn of mf.functions) { 
            let newFunction = this.buildFunction(mf, mfn);
            if (this.isDebugging) {
                newFunction = this.logFunction(mf, mfn, newFunction);
            }
            this.replaceModuleScopeFunction(mfn.name, newFunction);
        }
    }

    logFunction(mf: MetaFeature, mfn: MetaFunction, func: Function) : Function {
        if (mfn.isAsync) {
            return async function (...args: any[]) {
                _stack.push(`${mf.name}.${mfn.name}`);
                _suffix = `◀︎ ${_stack[_stack.length-1]}`;
                const result = await func(...args);
                _stack.pop();
                _suffix = (_stack.length > 0) ? `◀︎ ${_stack[_stack.length-1]}` : '';
                return result;
            };
        } else {
            return function (...args: any[]) {
                _stack.push(`${mf.name}.${mfn.name}`);
                _suffix = `◀︎ ${_stack[_stack.length-1]}`;
                const result = func(...args);
                _stack.pop();
                _suffix = (_stack.length > 0) ? `◀︎ ${_stack[_stack.length-1]}` : '';
                return result;
            };
        }
    }

    buildFunction(mf: MetaFeature, mfn: MetaFunction) : Function {
        if (mfn.decorator == "on") { return this.buildOnFunction(mf, mfn); }
        else if (mfn.decorator == "after") { return this.buildAfterFunction(mf, mfn); }
        else if (mfn.decorator == "before") { return this.buildBeforeFunction(mf, mfn); }
        else { throw new Error(`unknown decorator ${mfn.decorator}`); }
    }

    buildOnFunction(mf: MetaFeature, mfn: MetaFunction) : Function {
        const boundMethod = mfn.method.bind(mf.instance);
        return boundMethod;
    }

    buildAfterFunction(mf: MetaFeature, mfn: MetaFunction) : Function {
        const originalFunction = functionRegistry[mfn.name];
        if (!originalFunction) { throw new Error(`function ${mfn.name} not found`); }
        if (mfn.isAsync) {
            const newFunction = async function (...args: any[]) {
                let _result = await originalFunction(...args);
                return mfn.method.apply(mf.instance, [...args, _result]);
            };
            return newFunction;
        } else {
            if (!mfn.isAsync) { throw new Error(`@after: ${mfn.name} must be async`); }
            const newFunction = function (...args: any[]) {
                let _result = originalFunction(...args);
                return mfn.method.apply(mf.instance, [...args, _result]);
            };
            return newFunction;
        }
    }

    buildBeforeFunction(mf: MetaFeature, mfn: MetaFunction) : Function {
        const originalFunction = functionRegistry[mfn.name];
        if (!originalFunction) { throw new Error(`function ${mfn.name} not found`); }
        if (mfn.isAsync) {
            const newFunction =  async function (...args: any[]) {
                const newResult = await mfn.method.apply(mf.instance, args);
                if (newResult !== undefined) { return newResult; }
                return originalFunction(...args);
            };
            return newFunction;
        } else {
            if (!mfn.isAsync) { throw new Error(`@before: ${mfn.name} must be async`); }
            const newFunction = function (...args: any[]) {
                const newResult = mfn.method.apply(mf.instance, args);
                if (newResult !== undefined) { return newResult; }
                return originalFunction(...args);
            };
            return newFunction;
        }
    }

    replaceModuleScopeFunction(name: string, newFn: Function) {
        if (functionRegistry[name]) {
            (proxiedGlobalThis as any)[name] = newFn;
            functionNames.set(newFn, name);
        } else {
            this.defineModuleScopeFunction(name, newFn);
        }
    }

    defineModuleScopeFunction(name: string, fn: Function) {
        (proxiedGlobalThis as any)[name] = fn;
        functionNames.set(fn, name);
    }

    listModuleScopeFunctions() {
        console.log("Defined functions:", Object.keys(functionRegistry));
    }

    clearModuleScopeFunctions() {
        for(let name of Object.keys(functionRegistry)) {
            const fn = (proxiedGlobalThis as any)[name];
            delete (proxiedGlobalThis as any)[name];
            functionNames.delete(fn);
        }
    }

    getModuleScopeFunction(name: string) {
        return functionRegistry[name];
    }

    getFunctionName(fn: Function) {
        return functionNames.get(fn);
    }

    getFunctionParams(name: string) {
        return MetaFunction._byName[name].params;
    }
}

export const fm = new FeatureManager();

//------------------------------------------------------------------------------
// Websockets

