// ᕦ(ツ)ᕤ
// fm.ts
// author: asnaroo
// feature-modular typescript
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
        this.logging = true; // if set, log all calls within this feature
        this.testFunction = null; // the test function for this feature
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
    async test() {
        if (this.testFunction) {
            let result = await this.testFunction.method.apply(this.instance, []);
            if (!result) {
                console.log("Test failed for", this.name);
            }
            return result;
        }
        console.log("No test function found for", this.name);
        return true;
    }
}
MetaFeature._all = []; // all features in declaration order
MetaFeature._byname = {}; // map feature name to MetaFeature
// everything there is to know about a function defined inside a feature
class MetaFunction {
    constructor(name, method, decorator) {
        this.params = []; // parameter names  
        this.logging = true; // logging enabled by default
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
// @nolog decorator handler
export function nolog(constructor) {
    const className = constructor.name;
    const mf = MetaFeature._findOrCreate(className);
    if (mf) {
        mf.logging = false;
    }
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
// @test decorator handler
export function test(target, propertyKey, descriptor) {
    const method = descriptor.value;
    const className = target.constructor.name;
    const mf = MetaFeature._findOrCreate(className);
    mf.testFunction = new MetaFunction(propertyKey, method, "test");
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
    // disable one or more features
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
    // output current feature tree to console
    readout(showFunctions = false, mf = null, indent = 0) {
        if (!mf) {
            mf = MetaFeature._byname["_Feature"];
            console.log("Defined features:");
        }
        if (mf.isEnabled()) {
            let fnList = showFunctions ? mf.functions.map(f => (f.decorator != "def" ? "+" : "") + f.name).join(" ") : "";
            console.log(`${" ".repeat(indent)}${mf.name} ${console_grey(fnList)}`);
            for (let c of mf.children) {
                this.readout(showFunctions, c, indent + 2);
            }
        }
        else {
            console.log(mf.name, "(disabled)");
        }
    }
    // turn logging off or on for all features
    debug(onOff) {
        this.isDebugging = onOff;
        this.rebuild();
    }
    // run all tests, in tree order
    async test(mf = null) {
        if (!mf) {
            mf = MetaFeature._byname["_Feature"];
        }
        if (!mf.enabled) {
            return true;
        }
        let result = await mf.test();
        for (let c of mf.children) {
            let subResult = await this.test(c);
            result && (result = subResult);
        }
        return result;
    }
    // rebuild all features
    rebuild() {
        this.clearModuleScopeFunctions();
        for (let mf of MetaFeature._all) {
            if (mf.isEnabled()) {
                this.buildFeature(mf);
            }
        }
    }
    // build all functions for a feature
    buildFeature(mf) {
        for (let mfn of mf.functions) {
            let newFunction = this.buildFunction(mf, mfn);
            Object.defineProperty(newFunction, "name", { value: mfn.name });
            if (this.isDebugging && mf.logging) {
                newFunction = this.logFunction(mf, mfn, newFunction);
            }
            this.replaceModuleScopeFunction(mfn.name, newFunction);
        }
    }
    // returns a function wrapping the original function with logging calls
    logFunction(mf, mfn, func) {
        if (mfn.isAsync) {
            return async function (...args) {
                let parentLog = log_group(mfn.name);
                const result = await log_async(func, ...args);
                log_push(result.log, parentLog);
                log_end_group();
                return result.result;
            };
        }
        else {
            return function (...args) {
                log_group(mfn.name);
                const result = func(...args);
                log_end_group();
                return result;
            };
        }
    }
    // build a function based on the MetaFunction
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
    // build a function that defines a new function
    buildDefFunction(mf, mfn) {
        const originalFunction = functionRegistry[mfn.name];
        if (originalFunction) {
            throw new Error(`${mf.name}.def: ${mfn.name} already exists`);
        }
        const boundMethod = mfn.method.bind(mf.instance);
        return boundMethod;
    }
    // build a function that replaces an existing function with a new one
    buildReplaceFunction(mf, mfn) {
        const originalFunction = functionRegistry[mfn.name];
        if (!originalFunction) {
            throw new Error(`${mf.name}.replace: ${mfn.name} not found`);
        }
        const boundMethod = mfn.method.bind(mf.instance);
        return boundMethod;
    }
    // build a function that extends the original with a parallel call to the new one
    buildOnFunction(mf, mfn) {
        const boundMethod = mfn.method.bind(mf.instance);
        const originalFunction = functionRegistry[mfn.name];
        if (!originalFunction)
            return boundMethod;
        if (!mfn.isAsync) {
            throw new Error(`${mf.name}.on: ${mfn.name} must be async`);
        }
        return async function (...args) {
            return Promise.all([originalFunction(...args), boundMethod(...args)]);
        };
    }
    // build a function that calls the new function after the original
    buildAfterFunction(mf, mfn) {
        const originalFunction = functionRegistry[mfn.name];
        if (!originalFunction) {
            throw new Error(`${mf.name}.after: ${mfn.name} not found`);
        }
        if (mfn.isAsync) {
            if (!isAsyncFunction(mfn.method)) {
                throw new Error(`${mf.name}.before: ${mfn.name} must be async`);
            }
            const newFunction = async function (...args) {
                let _result = await originalFunction(...args);
                return mfn.method.apply(mf.instance, [...args, _result]);
            };
            return newFunction;
        }
        else {
            const newFunction = function (...args) {
                let _result = originalFunction(...args);
                return mfn.method.apply(mf.instance, [...args, _result]);
            };
            return newFunction;
        }
    }
    // build a function that calls the new function before the original
    buildBeforeFunction(mf, mfn) {
        const originalFunction = functionRegistry[mfn.name];
        if (!originalFunction) {
            throw new Error(`${mf.name}.before: ${mfn.name} not found`);
        }
        if (mfn.isAsync) {
            if (!isAsyncFunction(mfn.method)) {
                throw new Error(`${mf.name}.before: ${mfn.name} must be async`);
            }
            const newFunction = async function (...args) {
                const newResult = await mfn.method.apply(mf.instance, args);
                if (newResult !== undefined) {
                    return newResult;
                }
                return originalFunction(...args);
            };
            return newFunction;
        }
        else {
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
    //-------------------------------------------------------------------------
    // low-level function management in module (=global) scope
    // replace a function in module (=global) scope
    replaceModuleScopeFunction(name, newFn) {
        if (functionRegistry[name]) {
            proxiedGlobalThis[name] = newFn;
            functionNames.set(newFn, name);
        }
        else {
            this.defineModuleScopeFunction(name, newFn);
        }
    }
    // define a function in module (=global) scope
    defineModuleScopeFunction(name, fn) {
        proxiedGlobalThis[name] = fn;
        functionNames.set(fn, name);
    }
    // list all functions in module (=global) scope
    listModuleScopeFunctions() {
        console.log("Defined functions:");
        for (let name of Object.keys(functionRegistry)) {
            console.log("   ", name);
        }
    }
    // clear all functions in module (=global) scope
    clearModuleScopeFunctions() {
        for (let name of Object.keys(functionRegistry)) {
            const fn = proxiedGlobalThis[name];
            delete proxiedGlobalThis[name];
            functionNames.delete(fn);
            delete functionRegistry[name];
        }
    }
    // find a function from module (=global) scope by name
    getModuleScopeFunction(name) {
        return functionRegistry[name];
    }
    // low-level: get the name of a function
    getFunctionName(fn) {
        let name = fn.name;
        if (name && name != "") {
            return name;
        }
        return functionNames.get(fn);
    }
    // low-level: get the parameters of a function
    getFunctionParams(name) {
        return MetaFunction._byName[name].params;
    }
}
export const fm = new FeatureManager();
//# sourceMappingURL=fm.js.map