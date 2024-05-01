// ᕦ(ツ)ᕤ
// fm.ts
// author: asnaroo
// feature-modular typescript

// fx is the "executable: enable/disable settings and actual functions
export var fx: any = {};    // actual functions for all features

//------------------------------------------------------------------------------
// fm is the main object that holds all the features and functions

// Feature is just a class with no methods
export class Feature {}     // base feature

// MetaFeature holds relationships, enable state
class MetaFeature {
    name: string;
    parent: MetaFeature|null = null;
    children: MetaFeature[] = [];
    constructor(name: string, parent: string="") {
        this.name = name;
        if (parent != "") {
            this.parent = fm.metafeatures[parent];
            this.parent!.children.push(this);
        }
        this.children = [];
    }
}

// Fm represents the code, all its static state
export class Fm {
    features: any = {};          // all feature classes (instance of each)
    metafeatures: any = {};      // metafeatures store relationships between features
    composites: any = {};        // all composite functions (instance of each)

    constructor() {
        this.features["Feature"] = new Feature();
        this.metafeatures["Feature"] = new MetaFeature("Feature", "");
    }
    
    readout_features(metaFeature: MetaFeature|null = null) {
        if (!metaFeature) metaFeature = this.metafeatures["Feature"];
        console.log(`${metaFeature!.name}`);
        console_indent();
        for(let c of metaFeature!.children) {
            this.readout_features(c);
        }
        console_undent();
    }

    readout_functions() {
        for(let c in this.composites) {
            console.log(`${c}: ${this.composites[c].toString()}`);
        }
    }

    build_fx() {
       this.build_fx_disable([]);
    }

    build_fx_disable(featuresToDisable: string[]) {
        fx["_enabled"] = {};
        for(let f in this.metafeatures) { fx["_enabled"][f] = true; }
        for(let f of featuresToDisable) { fx["_enabled"][f] = false;}
        for(let f in this.metafeatures) { fx[this.features[f].constructor.name] = this.features[f]; }
        for(let c in this.composites) { fx[c] = null; }
        this.build_fx_functions();
    }

    enabled(featureName: string): boolean {
        let result = true;
        let mf = this.metafeatures[featureName];
        while (mf && result) {
            result = result && fx._enabled[mf.name];
            mf = mf.parent;
        }
        return result;
    }

    readout_fx_features(mf: MetaFeature|null=null) {
        if (!mf) mf = this.metafeatures["Feature"];
        let enabled = this.enabled(mf!.name);
        if (enabled) { console.log(`${mf!.name}`); }
        else { console.log(`\x1b[48;5;234m\x1b[30m${mf!.name}\x1b[0m`); }
        if (!enabled) return;
        console_indent();
        for(let c of mf!.children) {
            this.readout_fx_features(c);
        }
        console_undent();
    }

    readout_fx_functions() {
        for(let c in this.composites) {
            let fn = fx[c];
            let fnstr = fn ? fn.toString() : "null";
            console.log(`fx.${c} = ${fnstr}`);
        }
    }

    build_fx_functions() {
        for(let c in this.composites) {
            console_indent();
            fx[c] = this.build(this.composites[c]);
            console_undent();
        }
    }

    build(composite : CompositeFunction) : Function|null {
        let result : Function|null = null;
        if (composite.type == "on") {
            result = this.build_on(composite);
        } else if (composite.type == "before") {
            result = this.build_before(composite);
        } else if (composite.type == "after") {
            result = this.build_after(composite);
        }
        return result;
    }

    build_on(composite: CompositeFunction) : Function|null {
        return this.build_single(composite.fn);
    }

    build_before(composite: CompositeFunction) : Function|null {
        let func = this.build_single(composite.fn);
        let existing = this.build(composite.existing!);
        if (!func) return existing;
        if (!existing) return func;
        return function (...args: any[]) {
            let result: any = func.apply(fm.composites[composite.fn.featureName], args);
            if (result instanceof Promise) {
                return result.then((result: any) => {
                    if (result) return result;
                    return existing!.apply(fm.composites[composite.fn.featureName], args);
                });
            } else {
                if (result) return result;
                return existing!.apply(fm.composites[composite.fn.featureName], args);
            }
        };
    }

    build_after(composite: CompositeFunction) : Function|null {
        let func = this.build_single(composite.fn);
        let existing = this.build(composite.existing!);
        if (!func) return existing;
        if (!existing) return func;
        return function (...args: any[]) {
            let _result: any = existing!.apply(fm.composites[composite.fn.featureName], args);
            if (_result instanceof Promise) {
                return _result.then((result: any) => {
                    _result = result;
                    return func.apply(fm.composites[composite.fn.featureName], [args, _result]);
                });
            } else {
                return func.apply(fm.composites[composite.fn.featureName], [args, _result]);
            }
        };
    }

    build_single(fn: FeatureFunction) : Function|null {
        if (!this.enabled(fn.featureName)) return null;
        return function (...args: any[]) {
            console.log(`\x1b[48;5;234m\x1b[30m${fn.featureName}.${fn.methodName}\x1b[0m`);
            console_indent();
            let result: any = fn.descriptor.value.apply(fm.composites[fn.featureName], args);
            console_undent();
            return result;
        };
    }
}

// fm is the "code" : the features and their relationships
export let fm: Fm = new Fm();

//------------------------------------------------------------------------------
// On, Before, After, Replace classes

// FeatureFunction refers to a specific method defined in a feature clause
class FeatureFunction { 
    featureName: string;
    methodName: string;
    descriptor: PropertyDescriptor;
    constructor(featureName: string, methodName: string, descriptor: PropertyDescriptor) {
        this.featureName = featureName;
        this.methodName = methodName;
        this.descriptor = descriptor;
    }
    toString() : string { return `${this.featureName}.${this.methodName}`; }
}

// CompositeFunction is a monolithic function constructed from FeatureFunctions
class CompositeFunction {
    type: string;
    fn: FeatureFunction;
    existing: CompositeFunction|undefined;
    constructor(type: string, fn: FeatureFunction, existing: CompositeFunction|undefined = undefined) {
        this.type = type;
        this.fn = fn;
        this.existing = existing;
    }
    toString() : string {
        if (this.existing) {
            return `(${this.fn.toString()} ${this.type} ${this.existing.toString()})`;
        } else {
            return `(${this.fn.toString()})`;
        }
    }
}

// add a new composite function to cf
function addComposite(type: string, featureName: string, fn: string, descriptor: PropertyDescriptor) {
    let newFn = new FeatureFunction(featureName, fn, descriptor);
    let existing = fm.composites[fn];
    let newComposite = new CompositeFunction(type, newFn, existing);
    fm.composites[fn] = newComposite;
}

//------------------------------------------------------------------------------
// decorators

export function feature(TargetClass: { new(...args: any[]): {} }) {
    return function (constructor: { new(...args: any[]): any }) {
        const className = constructor.name;
        const parentName = TargetClass.name;
        fm.features[className] = new constructor();
        fm.metafeatures[className] = new MetaFeature(className, parentName);
    }
}

export function on(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    addComposite("on", target.constructor.name, propertyKey, descriptor);
}

export function before(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    addComposite("before", target.constructor.name, propertyKey, descriptor);
}

export function after(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    addComposite("after", target.constructor.name, propertyKey, descriptor);
}

//------------------------------------------------------------------------------

let _result: any= null;     // allows @after methods to sneak a result into the original method
let _existing: any= null;   // allows @replace methods to sneak the original method into the new method
let _indent: string = "";   // start of each console for indenting

function formatLog(...args: any[]): string {
    // Convert all arguments to strings and handle objects specifically
    return args.map(arg => {
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
}

const originalConsoleLog = console.log;     // Store the original console.log function
console.log = (...args) => {                // Override console.log
    originalConsoleLog(_indent + formatLog(...args)); 
};
const console_indent = () => { _indent += "  "; };  // Add two spaces to the indentation
const console_undent = () => { _indent = _indent.slice(0, -2); };  // Remove two spaces from the indentation


function functionFromMethod(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    return function (...args: any[]) {
        console.log(`\x1b[48;5;234m\x1b[30m${target.constructor.name}.${propertyKey}\x1b[0m`);
        console_indent();
        let result: any = descriptor.value.apply(fm.composites[target.constructor.name], args);    // Call the original method on the new instance
        console_undent();
        return result;
    };
}

//------------------------------------------------------------------------------
// build actual functions

// build actual functions using enable/disable settings
function build(fm: any) : any {
}

/*

// adds the class to fm
export function feature(TargetClass: { new(...args: any[]): {} }) {
    return function (constructor: { new(...args: any[]): any }) {
        console.log(`feature ${constructor.name} extends ${TargetClass.name}`);
        fm[constructor.name] = new constructor();  // Use the 'new' operator with the constructor to create an instance
    }
}

// adds the function to fm if it doesn't exist, otherwise creates a new function that calls both the existing and new functions in parallel
export function on(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    let newFunction = functionFromMethod(target, propertyKey, descriptor);
    if (!fm[propertyKey]) {                                     // Check if 'fm' already has a function with this name
        fm[propertyKey] = newFunction;
    } else {
        throw new Error(`@on ${target.constructor.name}.${propertyKey} : function already exists`);
    }
}

// before makes a composite function that calls the new one, then calls the existing one
export function before(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    if (!fm[propertyKey]) { throw new Error("@before couldn't find original function"); }
    const existingFunction = fm[propertyKey];
    let newFunction = functionFromMethod(target, propertyKey, descriptor);
    fm[propertyKey] = function (...args: any[]) {         // Create a function that calls both the existing and new functions in parallel
        let result : any = newFunction.apply(fm[target.constructor.name], args);        // Execute the new function
        if (result instanceof Promise) {
            return result.then((result: any) => {         // Wait for the new function to resolve
                if (result) return result;                  // If the new function returned a result, return it
                return existingFunction.apply(fm[target.constructor.name], args);  // Call the existing function
            });
        } else {
            if (result) return result;                      // If the new function returned a result, return it
            return existingFunction.apply(fm[target.constructor.name], args);  // Call the new function
        }
    };
}

// makes a composite function that calls the existing one, then the new one, and sneaks the result into the new one
export function after(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    if (!fm[propertyKey]) { throw new Error("@before couldn't find original function"); }
    const originalMethod = descriptor.value;                    // Save the original method to wrap it
    const existingFunction = fm[propertyKey];
    let newFunction = function(...args: any[]) {
        console.log(`\x1b[48;5;234m\x1b[30m${target.constructor.name}.${propertyKey}\x1b[0m`);
        _indent += "  ";
        let result: any = originalMethod.apply(fm[target.constructor.name], [...args, _result]);   // sneak result into original method
        _indent = _indent.slice(0, -2);
        return result;
    }
    if (!fm[propertyKey]) { throw new Error("@before couldn't find original function"); }
    fm[propertyKey] = function (...args: any[]) {         // Create a function that calls the existing, then the new function
        let _result = existingFunction.apply(args);       // Call the existing function
        if (_result instanceof Promise) {
            return _result.then((result: any) => {         // Wait for the existing function to resolve
                _result = result;                          // Save the result so it gets sneaked into new function
                return newFunction.apply(fm[target.constructor.name], args);  // Call the new function
            });
        } else {
            return newFunction.apply(fm[target.constructor.name], args);  // Call the new function
        }
    }
}

// replaces the current definition, if any, with the new one
// TODO: sneak "_existing" into the new function
export function replace(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    if (!fm[propertyKey]) { throw new Error("@replace couldn't find original function"); }
    const originalMethod = descriptor.value;                    // Save the original method to wrap it
    let _existing = fm[propertyKey];                            // Save the existing function
    let newFunction = function (...args: any[]) {               // Create a function that instantiates the target class and calls the method    
        return originalMethod.apply(fm[target.constructor.name], [...args, _existing]);  // Call the original method on the new instance
    };
    fm[propertyKey] = newFunction;
}

*/

