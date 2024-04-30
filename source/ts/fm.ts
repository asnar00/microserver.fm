// ᕦ(ツ)ᕤ
// fm.ts
// author: asnaroo
// feature-modular typescript

//------------------------------------------------------------------------------

// base class of all features
export class Feature {}

// repository of all features
export class Features {
}

export let fm: any = {};    // context: functions and feature objects
let _result: any= null;     // allows @after methods to sneak a result into the original method
let _existing: any= null;   // allows @replace methods to sneak the original method into the new method
let _indent: string = "";   // start of each console for indenting
let _grey: string = '\x1b[47m\x1b[30m%s\x1b[0m';  // start of each console for grey background

const originalConsoleLog = console.log;     // Store the original console.log function
console.log = (...args) => {                // Override console.log
    originalConsoleLog(_indent, ...args);// Prepend the indentation to the original arguments and pass them to the original console.log
};

function functionFromMethod(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    return function (...args: any[]) {
        console.log(`\x1b[48;5;234m\x1b[30m${target.constructor.name}.${propertyKey}\x1b[0m`);
        _indent += "  ";
        let result: any = descriptor.value.apply(fm[target.constructor.name], args);    // Call the original method on the new instance
        _indent = _indent.slice(0, -2);
        return result;
    };
}

//------------------------------------------------------------------------------
// decorator definitions

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

