// ᕦ(ツ)ᕤ
// fm.ts
// author: asnaroo
// feature-modular typescript
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
// logging
let _indent = ""; // start of each console for indenting
let _suffix = ""; // at the end of each console line, print this in grey
let _stack = []; // current callstack
let _width = 80; // width of the console
function formatLog(...args) {
    // Convert all arguments to strings and handle objects specifically
    let outstr = args.map(arg => {
        if (typeof arg === 'object') {
            // Use JSON.stringify to convert objects to strings
            try {
                return JSON.stringify(arg, null, 2);
            }
            catch (error) {
                return String(arg);
            }
        }
        else {
            // Convert non-objects to strings directly
            return String(arg);
        }
    }).join(' '); // Join all parts with a space, similar to how console.log does
    if (_suffix != "") {
        let crstr = "";
        while (outstr.length >= _width) {
            crstr += outstr.slice(0, _width) + "\n";
            outstr = outstr.slice(_width);
        }
        let nSpaces = _width - outstr.length - _suffix.length;
        if (nSpaces > 0) {
            crstr += outstr + " ".repeat(nSpaces);
            crstr += console_grey(_suffix);
        }
        else {
            crstr += outstr + "\n";
            crstr += " ".repeat(_width - _suffix.length) + console_grey(_suffix);
        }
        return crstr;
    }
    return outstr;
}
const originalConsoleLog = console.log; // Store the original console.log function
console.log = (...args) => {
    originalConsoleLog(_indent + formatLog(...args));
};
export const console_indent = () => { _indent += "  "; }; // Add two spaces to the indentation
export const console_undent = () => { _indent = _indent.slice(0, -2); }; // Remove two spaces from the indentation
export const console_separator = () => { console.log("-".repeat(_width)); }; // Print a separator line
export function console_grey(str) { return `\x1b[48;5;234m\x1b[30m${str}\x1b[0m`; }
//------------------------------------------------------------------------------
// base class of all feature clauses
export class _Feature {
    test() { }
    existing(fn) {
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
    constructor(name) {
        this.instance = null; // singleton instance
        this.properties = []; // all the properties we define (with decorators)
        this.functions = []; // all the functions we define, including decorators
        this.existing = {}; // maps function name to existing-function
        this.parent = null; // feature we extend
        this.children = []; // all features that extend this feature
        this.enabled = true; // whether this feature is enabled (and children)
        this.name = name;
        MetaFeature._all.push(this);
        MetaFeature._byname[name] = this;
    }
    initialise(parentName = "", instance) {
        this.instance = instance;
        this.parent = MetaFeature._byname[parentName] || null;
        if (this.parent) {
            this.parent.children.push(this);
        }
    }
    static _findOrCreate(name) {
        let mf = MetaFeature._byname[name];
        if (!mf) {
            mf = new MetaFeature(name);
        }
        return mf;
    }
    addFunction(mfn) {
        this.functions.push(mfn);
        const existingFn = fm.getModuleScopeFunction(mfn.name);
        if (existingFn) {
            this.existing[mfn.name] = existingFn;
        }
    }
    isEnabled() {
        let parent = this.parent;
        let enabled = this.enabled;
        while (parent && enabled) {
            enabled && (enabled = parent.enabled);
            parent = parent.parent;
        }
        return enabled;
    }
}
MetaFeature._all = []; // all features in declaration order
MetaFeature._byname = {}; // map feature name to MetaFeature
// everything there is to know about a function defined inside a feature
class MetaFunction {
    constructor(name, method, decorator) {
        this.params = []; // parameter names  
        this.name = name;
        this.method = method;
        this.decorator = decorator;
        this.isAsync = isAsyncFunction(method);
        this.returnsValue = returnsValue(method);
        this.params = listParams(method);
        MetaFunction._byName[name] = this;
    }
}
MetaFunction._byName = {};
// everything there is to know about a property defined inside a feature
class MetaProperty {
    constructor(name) {
        this.name = name;
    }
}
let _metaFeature = new MetaFeature("_Feature");
_metaFeature.initialise("", new _Feature());
//------------------------------------------------------------------------------
// decorators
// @feature decorator handler
export function feature(constructor) {
    const className = constructor.name;
    const prototype = Object.getPrototypeOf(constructor.prototype);
    const superClassConstructor = prototype ? prototype.constructor : null;
    const superClassName = superClassConstructor ? superClassConstructor.name : 'None';
    if (!className.startsWith("_")) {
        throw new Error(`Feature class name must start with an underscore: ${className}`);
    }
    const mf = MetaFeature._findOrCreate(className);
    const instance = new constructor();
    mf.initialise(superClassName, instance);
    fm.buildFeature(mf);
}
// @def decorator handler
export function def(target, propertyKey, descriptor) {
    const method = descriptor.value;
    const className = target.constructor.name;
    const mf = MetaFeature._findOrCreate(className);
    mf.addFunction(new MetaFunction(propertyKey, method, "def"));
}
// @replace decorator handler
export function replace(target, propertyKey, descriptor) {
    const method = descriptor.value;
    const className = target.constructor.name;
    const mf = MetaFeature._findOrCreate(className);
    mf.addFunction(new MetaFunction(propertyKey, method, "replace"));
}
// @on decorator handler
export function on(target, propertyKey, descriptor) {
    const method = descriptor.value;
    const className = target.constructor.name;
    const mf = MetaFeature._findOrCreate(className);
    mf.addFunction(new MetaFunction(propertyKey, method, "on"));
}
// @after decorator handler
export function after(target, propertyKey, descriptor) {
    const method = descriptor.value;
    const className = target.constructor.name;
    const mf = MetaFeature._findOrCreate(className);
    mf.addFunction(new MetaFunction(propertyKey, method, "after"));
}
// @before decorator handler
export function before(target, propertyKey, descriptor) {
    const method = descriptor.value;
    const className = target.constructor.name;
    const mf = MetaFeature._findOrCreate(className);
    mf.addFunction(new MetaFunction(propertyKey, method, "before"));
}
//------------------------------------------------------------------------------
// structure extension using Proxy and class trickery
const _initialisers = {};
export function struct(constructor) {
    var _a;
    _initialisers[constructor.name] = (instance, arg) => {
        const properties = Object.getOwnPropertyNames(instance);
        properties.forEach((key) => {
            if (arg && arg[key] !== undefined) {
                instance[key] = arg[key];
            }
        });
    };
    const newConstructor = (_a = class extends constructor {
            constructor(...args) {
                super(...args);
                const instance = this;
                _initialisers[constructor.name](instance, args[0]);
            }
        },
        _a.originalName = constructor.name,
        _a);
    // Set the name of the new constructor to be the same as the original
    Object.defineProperty(newConstructor, 'name', { value: constructor.name });
    return newConstructor;
}
export function extend(ExistingClass) {
    return function (constructor) {
        let initNewClass = (instance, args) => {
            const newInstance = new constructor(); // construct AdditionalClass
            const properties = Object.getOwnPropertyNames(newInstance);
            properties.forEach((key) => {
                if (args && args[key] !== undefined) {
                    instance[key] = args[key];
                }
                else {
                    instance[key] = newInstance[key];
                }
            });
        };
        let oldInit = _initialisers[ExistingClass.name];
        _initialisers[ExistingClass.name] = (instance, arg) => {
            oldInit(instance, arg);
            initNewClass(instance, arg);
        };
        return constructor;
    };
}
export function make(Cls, args) {
    // @ts-ignore
    return new Cls(args);
}
//------------------------------------------------------------------------------
// global function manipulator (warning: affects "global" i.e. module scope)
// Create a global function registry
const functionRegistry = {};
const functionNames = new Map();
// Create a Proxy handler
const handler = {
    set(target, property, value) {
        if (typeof value === 'function') {
            const name = property;
            functionRegistry[name] = value;
            functionNames.set(value, property);
        }
        return Reflect.set(target, property, value);
    }
};
// Create a Proxy for globalThis
const proxiedGlobalThis = new Proxy(globalThis, handler);
function isAsyncFunction(fn) {
    let fnString = fn.toString().trim();
    return (fnString.startsWith("async") || fnString.includes("__awaiter")); // works in deno or js
}
// returns true if the function returns a non-void value
function returnsValue(func) {
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
function listParams(func) {
    const funcStr = func.toString();
    const paramStr = funcStr.match(/\(([^)]*)\)/)[1];
    const params = paramStr.split(',').map(param => param.trim().split('=')[0].trim()).filter(param => param);
    return params;
}
//------------------------------------------------------------------------------
// Feature Manager
export class FeatureManager {
    constructor() {
        this.isDebugging = false;
    }
    test(mf = null) {
        if (!mf) {
            mf = MetaFeature._byname["_Feature"];
        }
        if (!mf.isEnabled()) {
            console.log('disabled');
            return;
        }
        console.groupCollapsed(mf.name);
        let feature = mf.instance;
        if (feature) {
            const hasTest = Object.getPrototypeOf(feature).hasOwnProperty('test');
            if (hasTest) {
                feature.test();
            }
            else {
                console.log("no test");
            }
        }
        for (let c of mf.children) {
            this.test(c);
        }
        console.groupEnd();
    }
    disable(featureNames) {
        for (let mf of MetaFeature._all) {
            mf.enabled = true;
        }
        for (let name of featureNames) {
            let mf = MetaFeature._byname[name];
            if (mf) {
                mf.enabled = false;
            }
        }
        this.rebuild();
    }
    readout(mf = null) {
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
        }
        else {
            console.log(console_grey(mf.name));
        }
    }
    debug(onOff) {
        this.isDebugging = onOff;
        this.rebuild();
    }
    rebuild() {
        this.clearModuleScopeFunctions();
        for (let mf of MetaFeature._all) {
            if (mf.isEnabled()) {
                this.buildFeature(mf);
            }
        }
    }
    buildFeature(mf) {
        for (let mfn of mf.functions) {
            let newFunction = this.buildFunction(mf, mfn);
            if (this.isDebugging) {
                newFunction = this.logFunction(mf, mfn, newFunction);
            }
            this.replaceModuleScopeFunction(mfn.name, newFunction);
        }
    }
    logFunction(mf, mfn, func) {
        if (mfn.isAsync) {
            return function (...args) {
                return __awaiter(this, void 0, void 0, function* () {
                    _stack.push(`${mf.name}.${mfn.name}`);
                    _suffix = `◀︎ ${_stack[_stack.length - 1]}`;
                    const result = yield func(...args);
                    _stack.pop();
                    _suffix = (_stack.length > 0) ? `◀︎ ${_stack[_stack.length - 1]}` : '';
                    return result;
                });
            };
        }
        else {
            return function (...args) {
                _stack.push(`${mf.name}.${mfn.name}`);
                _suffix = `◀︎ ${_stack[_stack.length - 1]}`;
                const result = func(...args);
                _stack.pop();
                _suffix = (_stack.length > 0) ? `◀︎ ${_stack[_stack.length - 1]}` : '';
                return result;
            };
        }
    }
    buildFunction(mf, mfn) {
        if (mfn.decorator == "def") {
            return this.buildDefFunction(mf, mfn);
        }
        else if (mfn.decorator == "replace") {
            return this.buildReplaceFunction(mf, mfn);
        }
        else if (mfn.decorator == "on") {
            return this.buildOnFunction(mf, mfn);
        }
        else if (mfn.decorator == "after") {
            return this.buildAfterFunction(mf, mfn);
        }
        else if (mfn.decorator == "before") {
            return this.buildBeforeFunction(mf, mfn);
        }
        else {
            throw new Error(`unknown decorator ${mfn.decorator}`);
        }
    }
    buildDefFunction(mf, mfn) {
        const originalFunction = functionRegistry[mfn.name];
        if (originalFunction) {
            throw new Error(`${mf.name}.def: ${mfn.name} already exists`);
        }
        const boundMethod = mfn.method.bind(mf.instance);
        return boundMethod;
    }
    buildReplaceFunction(mf, mfn) {
        const originalFunction = functionRegistry[mfn.name];
        if (!originalFunction) {
            throw new Error(`${mf.name}.replace: ${mfn.name} not found`);
        }
        const boundMethod = mfn.method.bind(mf.instance);
        return boundMethod;
    }
    buildOnFunction(mf, mfn) {
        const boundMethod = mfn.method.bind(mf.instance);
        const originalFunction = functionRegistry[mfn.name];
        if (!originalFunction)
            return boundMethod;
        if (!mfn.isAsync) {
            throw new Error(`${mf.name}.on: ${mfn.name} must be async`);
        }
        return function (...args) {
            return __awaiter(this, void 0, void 0, function* () {
                return Promise.all([originalFunction(...args), boundMethod(...args)]);
            });
        };
    }
    buildAfterFunction(mf, mfn) {
        const originalFunction = functionRegistry[mfn.name];
        if (!originalFunction) {
            throw new Error(`${mf.name}.after: ${mfn.name} not found`);
        }
        if (mfn.isAsync) {
            const newFunction = function (...args) {
                return __awaiter(this, void 0, void 0, function* () {
                    let _result = yield originalFunction(...args);
                    return mfn.method.apply(mf.instance, [...args, _result]);
                });
            };
            return newFunction;
        }
        else {
            if (!mfn.isAsync) {
                throw new Error(`${mf.name}.after: ${mfn.name} must be async`);
            }
            const newFunction = function (...args) {
                let _result = originalFunction(...args);
                return mfn.method.apply(mf.instance, [...args, _result]);
            };
            return newFunction;
        }
    }
    buildBeforeFunction(mf, mfn) {
        const originalFunction = functionRegistry[mfn.name];
        if (!originalFunction) {
            throw new Error(`${mf.name}.before: ${mfn.name} not found`);
        }
        if (mfn.isAsync) {
            const newFunction = function (...args) {
                return __awaiter(this, void 0, void 0, function* () {
                    const newResult = yield mfn.method.apply(mf.instance, args);
                    if (newResult !== undefined) {
                        return newResult;
                    }
                    return originalFunction(...args);
                });
            };
            return newFunction;
        }
        else {
            if (!mfn.isAsync) {
                throw new Error(`${mf.name}.before: ${mfn.name} must be async`);
            }
            const newFunction = function (...args) {
                const newResult = mfn.method.apply(mf.instance, args);
                if (newResult !== undefined) {
                    return newResult;
                }
                return originalFunction(...args);
            };
            return newFunction;
        }
    }
    replaceModuleScopeFunction(name, newFn) {
        if (functionRegistry[name]) {
            proxiedGlobalThis[name] = newFn;
            functionNames.set(newFn, name);
        }
        else {
            this.defineModuleScopeFunction(name, newFn);
        }
    }
    defineModuleScopeFunction(name, fn) {
        proxiedGlobalThis[name] = fn;
        functionNames.set(fn, name);
    }
    listModuleScopeFunctions() {
        console.log("Defined functions:");
        for (let name of Object.keys(functionRegistry)) {
            console.log("   ", name);
        }
    }
    clearModuleScopeFunctions() {
        for (let name of Object.keys(functionRegistry)) {
            const fn = proxiedGlobalThis[name];
            delete proxiedGlobalThis[name];
            functionNames.delete(fn);
            delete functionRegistry[name];
        }
    }
    getModuleScopeFunction(name) {
        return functionRegistry[name];
    }
    getFunctionName(fn) {
        return functionNames.get(fn);
    }
    getFunctionParams(name) {
        return MetaFunction._byName[name].params;
    }
}
export const fm = new FeatureManager();
//------------------------------------------------------------------------------
// Websockets
