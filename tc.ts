// type-checking

class Feature {
    static _all : Feature[] = [];
    static _reset() {
        for(let i= Feature._all.length-1; i>=0; i--) {
            Feature._all[i].disable();
        }
    }
    static _disable(features: Function[]=[]) {
        Feature._reset();
        for(let i=0; i< Feature._all.length; i++) {
            let enabled: boolean = true;
            for(let j=0; j< features.length; j++) {
                if (Feature._all[i] instanceof features[j]) {
                    enabled = false;
                    console.log("disable", Feature._all[i]);
                    break;
                }
            }
            if (enabled) {
                Feature._all[i].enable();
            } 
        }
        console.log("--------------");
    }
    constructor() { Feature._all.push(this); this.enable(); }
    enable() {}
    disable() {}
}


//------------------------------------------------------------------------------
// decorator "feature"

function feature<T extends { new (...args: any[]): {} }>(constructor: T) {
    const className = constructor.name;
    const prototype = Object.getPrototypeOf(constructor.prototype);
    const superClassConstructor = prototype ? prototype.constructor : null;
    const superClassName = superClassConstructor ? superClassConstructor.name : 'None';
    console.log("feature", className, "extends", superClassName);
    const instance = new constructor();
}

//------------------------------------------------------------------------------
/*
    feature Main
        on main()
*/

let main = () => { };

@feature class Main extends Feature {
}

//------------------------------------------------------------------------------
/*
    feature Hello extends Main
        on hello()
            log("hello world");
        after main()
            hello();
*/

let hello = (name: string) => { console.log(`hello ${name}`); }

@feature class Hello extends Main {
    static _main = main;
    enable() { Hello._main = main; main = () => { Hello._main(); hello("asnaroo"); } }
    disable() { main = Hello._main; }
}

//------------------------------------------------------------------------------
/*
    feature Goodbye extends Main
        on bye()
            log("kthxbye");
        after main()
            bye();
*/

let bye = () => { console.log("kthxbye"); }

@feature class Goodbye extends Main {
    static _main = main;
    enable() { Goodbye._main = main; main = () => { Goodbye._main(); bye(); } }
    disable() { main = Goodbye._main; }
}

//------------------------------------------------------------------------------
/*
    feature Countdown extends Main
        on countdown()
            log("10 9 8 7 6 5 4 3 2 1");
        before main()
            countdown();
*/

let countdown = () => { console.log("10 9 8 7 6 5 4 3 2 1"); }

@feature class Countdown extends Main {
    static _main = main;
    enable() { Countdown._main = main; main = () => { countdown(); Countdown._main(); } }
    disable() { main = Countdown._main; }
}

console.log(Feature._all);
main();
Feature._disable([Hello, Countdown]);
main();
Feature._disable([]);
main();