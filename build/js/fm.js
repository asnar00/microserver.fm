// ᕦ(ツ)ᕤ
// fm.ts
// author: asnaroo
// feature-modular typescript
//------------------------------------------------------------------------------
// fm is the main object that holds all the features and functions
export class Fm {
    constructor() {
        this.features = {}; // all feature classes (instance of each)
        this.metafeatures = {}; // metafeatures store relationships between features
        this.composites = {}; // all composite functions (instance of each)
    }
    disable(featureName) {
        this.metafeatures[featureName].enabled = false;
    }
    enable(featureName) {
        this.metafeatures[featureName].enabled = true;
    }
    isEnabled(featureName) {
        let result = true;
        while (result && featureName != "Feature") {
            result = result && this.metafeatures[featureName].enabled;
            featureName = this.metafeatures[featureName].parent;
        }
        return result;
    }
    readout(featureName = "Feature") {
        console.log("//readout", featureName);
        console.log(featureName, this.metafeatures[featureName].enabled ? "✔️" : "x");
        _indent += "  ";
        for (let child of this.metafeatures[featureName].children) {
            this.readout(child);
        }
        _indent = _indent.slice(0, -2);
    }
}
export let fm = new Fm();
// fx is the "exexcutable: enable/disable settings and actual functions
export let fx = {}; // actual functions for all features
export class Feature {
} // base feature
class MetaFeature {
    constructor(name, parent) {
        this.name = name;
        this.parent = parent;
        this.children = [];
        this.enabled = true;
    }
}
;
//------------------------------------------------------------------------------
// On, Before, After, Replace classes
// FeatureFunction refers to a specific method defined in a feature clause
class FeatureFunction {
    constructor(featureName, methodName, descriptor) {
        this.featureName = featureName;
        this.methodName = methodName;
        this.descriptor = descriptor;
    }
    toString() { return `${this.featureName}.${this.methodName}`; }
}
// CompositeFunction is a monolithic function constructed from FeatureFunctions
class CompositeFunction {
    constructor(type, fn, existing = undefined) {
        this.type = type;
        this.fn = fn;
        this.existing = existing;
    }
    toString() {
        if (this.existing) {
            return `(${this.fn.toString()} ${this.type} ${this.existing.toString()})`;
        }
        else {
            return `(${this.fn.toString()})`;
        }
    }
}
// add a new composite function to cf
function addComposite(type, featureName, fn, descriptor) {
    let newFn = new FeatureFunction(featureName, fn, descriptor);
    let existing = fm.composites[fn];
    let newComposite = new CompositeFunction(type, newFn, existing);
    fm.composites[fn] = newComposite;
}
//------------------------------------------------------------------------------
// decorators
export function feature(TargetClass) {
    return function (constructor) {
        const className = constructor.name;
        const parentName = TargetClass.name;
        console.log(`feature ${className} extends ${parentName}`);
        fm.features[className] = new constructor();
        fm.metafeatures[className] = new MetaFeature(className, parentName);
    };
}
export function on(target, propertyKey, descriptor) {
    addComposite("on", target.constructor.name, propertyKey, descriptor);
}
export function before(target, propertyKey, descriptor) {
    addComposite("before", target.constructor.name, propertyKey, descriptor);
}
export function after(target, propertyKey, descriptor) {
    addComposite("after", target.constructor.name, propertyKey, descriptor);
}
//------------------------------------------------------------------------------
let _result = null; // allows @after methods to sneak a result into the original method
let _existing = null; // allows @replace methods to sneak the original method into the new method
let _indent = ""; // start of each console for indenting
let _grey = '\x1b[47m\x1b[30m%s\x1b[0m'; // start of each console for grey background
const originalConsoleLog = console.log; // Store the original console.log function
console.log = (...args) => {
    originalConsoleLog(_indent, ...args); // Prepend the indentation to the original arguments and pass them to the original console.log
};
function functionFromMethod(target, propertyKey, descriptor) {
    return function (...args) {
        console.log(`\x1b[48;5;234m\x1b[30m${target.constructor.name}.${propertyKey}\x1b[0m`);
        _indent += "  ";
        let result = descriptor.value.apply(fm.composites[target.constructor.name], args); // Call the original method on the new instance
        _indent = _indent.slice(0, -2);
        return result;
    };
}
//------------------------------------------------------------------------------
// build actual functions
// build actual functions using enable/disable settings
function build(fm) {
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
