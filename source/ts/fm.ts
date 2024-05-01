// ᕦ(ツ)ᕤ
// fm.ts
// author: asnaroo
// feature-modular typescript

// fm is the "executable: enable/disable settings and actual functions
export let fm: any = {};    // actual functions for all features
fm["_disabled"] = {};       // disabled features

let _stack: string[] = [];  // current callstack

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
            this.parent = fm._manager.metafeatures[parent];
            this.parent!.children.push(this);
        }
        this.children = [];
    }
}

// FeatureManager represents the code, all its static state
export class FeatureManager {
    features: any = {};          // all feature classes (instance of each)
    metafeatures: any = {};      // metafeatures store relationships between features
    composites: any = {};        // all composite functions (instance of each)
    debugging: boolean = true;  // debug mode

    constructor() {
        this.features["Feature"] = new Feature();
        this.metafeatures["Feature"] = new MetaFeature("Feature", "");
    }

    // readout features and functions
    readout() {
        console.log("features: -----------------------------------");
        this.readout_features();
        console.log("\nfunctions: ----------------------------------");
        this.readout_functions();
    }

    // disable one or more features by name
    disable(featuresToDisable: string[]) {
        this.reset();
        for(let f of featuresToDisable) { fm["_disabled"][f] = true;}
        this.build_all();
    }

    // debug mode
    debug(onOff: boolean) {
        this.debugging = onOff;
    }

    private reset() {
        for(let f in fm) { if (f[0]!="_") delete fm[f]; }
        fm["_disabled"] = {};
    }

    // build all functions with the current enabled/disabled state
    private build_all() {
        for(let c in this.composites) {
            this.build(c);
        }
    }

    private build(compositeName: string) {
        let func = this.build_function(this.composites[compositeName]);
        if (func) {
            fm[compositeName] = func;
        } else {
            delete fm[compositeName];
        }
    }

    // true if feature and all parents are enabled
    private enabled(featureName: string): boolean {
        let result = true;
        let mf = this.metafeatures[featureName];
        while (mf && result) {
            result = result && (!fm._disabled[mf.name]);
            mf = mf.parent;
        }
        return result;
    }

    // print a tree of features, with disabled ones greyed out and stubbed
    private readout_features(mf: MetaFeature|null=null) {
        if (!mf) mf = this.metafeatures["Feature"];
        let enabled = this.enabled(mf!.name);
        if (enabled) { console.log(`${mf!.name}`); }
        else { console.log(console_grey(mf!.name)); }
        if (!enabled) return;
        console_indent();
        for(let c of mf!.children) {
            this.readout_features(c);
        }
        console_undent();
    }

    // print composite-definitions of all functions
    private readout_functions() {
        for(let c in this.composites) {
            if (fm[c]) {
               console.log(`${c}: ${this.composites[c].toString()}`);
            }
        }
    }

    private build_function(composite : CompositeFunction) : Function|null {
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

    private build_on(composite: CompositeFunction) : Function|null {
        return this.build_single(composite.fn);
    }

    private build_before(composite: CompositeFunction) : Function|null {
        let func = this.build_single(composite.fn);
        let existing = this.build_function(composite.existing!);
        if (!func) return existing;
        if (!existing) return func;
        return function (...args: any[]) {
            let result: any = func.apply(fm._manager.composites[composite.fn.featureName], args);
            if (result instanceof Promise) {
                return result.then((result: any) => {
                    if (result) return result;
                    return existing!.apply(fm._manager.composites[composite.fn.featureName], args);
                });
            } else {
                if (result) return result;
                return existing!.apply(fm._manager.composites[composite.fn.featureName], args);
            }
        };
    }

    private build_after(composite: CompositeFunction) : Function|null {
        let func = this.build_single(composite.fn);
        let existing = this.build_function(composite.existing!);
        if (!func) return existing;
        if (!existing) return func;
        return function (...args: any[]) {
            let _result: any = existing!.apply(fm._manager.composites[composite.fn.featureName], args);
            if (_result instanceof Promise) {
                return _result.then((result: any) => {
                    _result = result;
                    return func.apply(fm._manager.composites[composite.fn.featureName], [args, _result]);
                });
            } else {
                return func.apply(fm._manager.composites[composite.fn.featureName], [args, _result]);
            }
        };
    }

    private build_single(fn: FeatureFunction) : Function|null {
        if (!this.enabled(fn.featureName)) return null;
        return function (...args: any[]) {
            if (fm._manager.debugging) {
                _stack.push(fn.toString());
                _suffix = `◀︎ ${_stack[_stack.length-1]}`;
            }
            let result: any = fn.descriptor.value.apply(fm._manager.composites[fn.featureName], args);  
            if (fm._manager.debugging) {
                _stack.pop();
                _suffix = `◀︎ ${_stack[_stack.length-1]}`;
            }
            return result;
        };
    }
}

fm['_manager'] = new FeatureManager();

//------------------------------------------------------------------------------
// On, Before, After classes

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
            let fn = (fm._disabled[this.fn.featureName]) ? "" : this.fn.toString();
            let existing = this.existing.toString();
            if (fn=="") return existing; else if (existing=="") return fn;
            return `(${this.fn.toString()} ${this.type} ${this.existing.toString()})`;
        } else {
            return (fm._disabled[this.fn.featureName]) ? "" : this.fn.toString();
        }
    }
}

// add a new composite function to cf
function addComposite(type: string, featureName: string, fn: string, descriptor: PropertyDescriptor) {
    let newFn = new FeatureFunction(featureName, fn, descriptor);
    let existing = fm._manager.composites[fn];
    let newComposite = new CompositeFunction(type, newFn, existing);
    fm._manager.composites[fn] = newComposite;
    fm._manager.build(fn);
}

//------------------------------------------------------------------------------
// decorators

export function feature(TargetClass: { new(...args: any[]): {} }) {
    return function (constructor: { new(...args: any[]): any }) {
        const className = constructor.name;
        const parentName = TargetClass.name;
        fm[className] = new constructor();
        fm._manager.features[className] = fm[className];
        fm._manager.metafeatures[className] = new MetaFeature(className, parentName);
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
let _suffix: string = "";   // at the end of each console line, print this in grey

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
        outstr += "\t" + console_grey(_suffix);
    }
    return outstr;
}

const originalConsoleLog = console.log;     // Store the original console.log function
console.log = (...args) => {                // Override console.log
    originalConsoleLog(_indent + formatLog(...args)); 
};
const console_indent = () => { _indent += "  "; };  // Add two spaces to the indentation
const console_undent = () => { _indent = _indent.slice(0, -2); };  // Remove two spaces from the indentation

function console_grey(str: string) : string {
   return `\x1b[48;5;234m\x1b[30m${str}\x1b[0m`;
}