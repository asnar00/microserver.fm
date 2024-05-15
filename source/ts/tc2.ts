// Create a global function registry
const functionRegistry: { [key: string]: Function } = {};

// Create a Proxy handler
const handler: ProxyHandler<typeof globalThis> = {
    set(target, property, value) {
        if (typeof value === 'function') {
            functionRegistry[property as string] = value;
        }
        return Reflect.set(target, property, value);
    }
};

// Create a Proxy for globalThis
const proxiedGlobalThis = new Proxy(globalThis, handler);

// A utility to define functions in the proxied context
function defineFunction(name: string, fn: Function) {
    (proxiedGlobalThis as any)[name] = fn;
}

// Function to list all defined functions
function listFunctions() {
    console.log("Defined functions:", Object.keys(functionRegistry));
}

// Function to replace a function in the module scope
function replaceModuleScopeFunction(name: string, newFn: Function) {
    if (functionRegistry[name]) {
        (proxiedGlobalThis as any)[name] = newFn;
        console.log(`Function ${name} has been replaced.`);
    } else {
        defineFunction(name, newFn);
        console.log(`Function ${name} has been defined.`);
    }
}

//--------------------------------------------------------------------------------
class Feature {
    static _all: any[] = [];
    static _byname: any = {};
    constructor() {}
    enable() {}
    disable() {}
};

// Deferred replacements map
const deferredReplacements: { [key: string]: Array<() => void> } = {};

let deferReplace = (className: string, replaceFn: () => void) => {
    if (!deferredReplacements[className]) {
        deferredReplacements[className] = [];
    }
    deferredReplacements[className].push(replaceFn);
}

// decorator "feature"
function feature<T extends { new (...args: any[]): {} }>(constructor: T) {
    const className = constructor.name;
    const prototype = Object.getPrototypeOf(constructor.prototype);
    const superClassConstructor = prototype ? prototype.constructor : null;
    const superClassName = superClassConstructor ? superClassConstructor.name : 'None';
    console.log("feature", className, "extends", superClassName);
    const instance = new constructor();
    Feature._all.push(instance);
    Feature._byname[className] = instance;
    if (deferredReplacements[className]) {
        deferredReplacements[className].forEach((replaceFn: () => void) => replaceFn());
        deferredReplacements[className] = [];
    }
}

//------------------------------------------------------------------------------
// decorator "on"

function on(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("on", propertyKey);

    const method = descriptor.value;
    const className = target.constructor.name;
    deferReplace(className, () => {
        const instance = Feature._byname[className];
        if (!instance) {
            throw new Error(`Instance of ${className} not found in _byname`);
        }

        const boundMethod = method.bind(instance);
        replaceModuleScopeFunction(propertyKey, boundMethod);
    });
}

//------------------------------------------------------------------------------
// decorator "after"

// Decorator to add behavior after the original function
function after(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const className = target.constructor.name;

    deferReplace(className, () => {
        const instance = Feature._byname[className];
        if (!instance) {
            throw new Error(`Instance of ${className} not found in _byname`);
        }

        const originalFunction = functionRegistry[propertyKey];
        if (!originalFunction) {
            throw new Error(`Original function ${propertyKey} not found`);
        }

        const newFunction = function (...args: any[]) {
            const _result = originalFunction(...args);
            return method.apply(instance, [...args, _result]);
        };

        replaceModuleScopeFunction(propertyKey, newFunction);
    });
}

//------------------------------------------------------------------------------
// Decorator to add behavior before the original function
function before(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const className = target.constructor.name;

    deferReplace(className, () => {
        const instance = Feature._byname[className];
        if (!instance) {
            throw new Error(`Instance of ${className} not found in _byname`);
        }

        const originalFunction = functionRegistry[propertyKey];
        if (!originalFunction) {
            throw new Error(`Original function ${propertyKey} not found`);
        }

        const newFunction = function (...args: any[]) {
            const newResult = method.apply(instance, args);
            if (newResult !== undefined) {
                return newResult;
            }
            return originalFunction(...args);
        };

        replaceModuleScopeFunction(propertyKey, newFunction);
    });
}

//------------------------------------------------------------------------------

declare const main: () => void;

@feature class Main extends Feature {
    @on main() { console.log("ᕦ(ツ)ᕤ"); }
}

//------------------------------------------------------------------------------

declare const hello: (name: string) => void;

@feature class Hello extends Main {
    @on hello(name: string) { console.log("hello", name); }
    @after main() { hello("asnaroo"); }
}

//------------------------------------------------------------------------------

declare const countdown: () => void;

@feature class Countdown extends Main {
    @on countdown() { console.log("10 9 8 7 6 5 4 3 2 1"); }
    @before main() { countdown(); }
}

main();